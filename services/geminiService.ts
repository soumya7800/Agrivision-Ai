import { GoogleGenAI, Type } from "@google/genai";
import { SoilData, PredictionResult } from "../types";
import { predictYieldFromXGBoost } from './xgboostService';

// Helper to ensure we get a valid JSON string
const cleanJson = (text: string) => {
  const match = text.match(/```json\n([\s\S]*?)\n```/);
  return match ? match[1] : text;
};

export const predictCropYield = async (data: SoilData): Promise<PredictionResult> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // 1. Get Statistical Prediction from XGBoost (Hybrid Model)
  const xgbYield = await predictYieldFromXGBoost(data);
  const yieldContext = xgbYield
    ? `**Statistical Model Baseline:** An optimized XGBoost regression model has PREDICTED a yield of ${xgbYield.toFixed(2)} tons/hectare. heavily weight your final prediction around this number unless visual evidence strongly suggests otherwise.`
    : "No statistical baseline available.";

  // Use a simulated delay to make the UI feel more "processing" if it's too fast (optional)
  // await new Promise(r => setTimeout(r, 1500));

  if (!apiKey) {
    console.warn("Gemini API Key missing - Falling back to Simulation Engine");
    return simulatePrediction(data);
  }

  const ai = new GoogleGenAI({ apiKey });

  const isVisionRequest = !!data.imageBase64;

  let prompt = "";
  let imagePart = null;

  if (isVisionRequest && data.imageBase64) {
    const base64Data = data.imageBase64.split(',')[1];
    imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: "image/jpeg",
      },
    };

    prompt = `
    You are an expert Agronomist and Plant Pathologist.
    Analyze the provided image and the environmental data.
    ${yieldContext}

    **Input Data:**
    - Location: ${data.country}
    - Environment: Temp=${data.temperature}°C, Humidity=${data.humidity}%, Rainfall=${data.rainfall}mm
    - Crop Context: ${data.cropType || "Unknown"}
    - Soil Data: N=${data.nitrogen}, P=${data.phosphorus}, K=${data.potassium}, pH=${data.ph}

    **Visual Analysis Task:**
    1. Identify the crop or plant in the image.
    2. DETECT DISEASES or PESTS visible in the image. If none, confirm the plant looks healthy.
    3. Assess soil condition/texture/moisture if visible.
    
    **Combined Analysis:**
    Based on the visual findings AND the environmental numbers:
    1. **Yield Prediction**: Estimate yield (tons/hectare). Align closely with the XGBoost baseline if healthy.
    2. **Sustainability**: Score (0-100).
    3. **Confidence**: Score (0-100) based on visual clarity and data match.
    4. **Recommendations**: 
       - If disease found: Specific treatment (organic/chemical).
       - If healthy: Optimization tips.
    5. **Market Analysis**: Brief potential.

    **Output Format:**
    Return strictly valid JSON matching the schema provided. 
    Notes: 
    - In 'limitingFactors', include any detected diseases.
    - In 'recommendations', prioritize disease management if applicable.
    `;

  } else {
    // Standard Text-Only Prompt
    prompt = `
    You are an expert Agronomist and Data Scientist specializing in precision agriculture for the region of ${data.country}.
    Your task is to analyze the provided soil and environmental data to predict crop yield and assess suitability.
    ${yieldContext}

    **Input Data:**
    - Location: ${data.country}
    - Crop: ${data.cropType || "General"}
    - Soil N-P-K: N=${data.nitrogen}, P=${data.phosphorus}, K=${data.potassium}
    - Environment: Temp=${data.temperature}°C, Humidity=${data.humidity}%, Rainfall=${data.rainfall}mm, pH=${data.ph}

    **Required Analysis:**
    1. **Yield Prediction**: Estimate yield in tons/hectare. Align closely with the XGBoost baseline (${xgbYield ? xgbYield.toFixed(2) : 'N/A'}) unless there are severe limiting factors.
    2. **Sustainability**: Evaluate the long-term impact on soil health (0-100).
    3. **Confidence**: How well do these conditions match the ideal requirements for ${data.cropType}? (0-100).
    4. **Recommendations**: Provide 2-4 concrete, actionable steps to improve yield or soil health.
    5. **Market Analysis**: Provide a brief, realistic market outlook.

    **Output Format:**
    Return strictly valid JSON matching the schema provided. Do not include markdown code blocks.
    `;
  }

  try {
    const contentParts: any[] = [prompt];
    if (imagePart) contentParts.push(imagePart);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contentParts,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            yieldPrediction: { type: Type.NUMBER, description: "Predicted yield in tons/hectare" },
            confidenceScore: { type: Type.NUMBER, description: "Confidence score 0-100" },
            sustainabilityScore: { type: Type.NUMBER, description: "Sustainability score 0-100" },
            limitingFactors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of limiting factors"
            },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  impact: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                  type: { type: Type.STRING, enum: ["nutrient", "irrigation", "general"] }
                },
                required: ["title", "description", "impact", "type"]
              }
            },
            marketAnalysis: {
              type: Type.OBJECT,
              properties: {
                trend: { type: Type.STRING, enum: ["Up", "Down", "Stable"] },
                estimatedPrice: { type: Type.STRING },
                demandLevel: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
              },
              required: ["trend", "estimatedPrice", "demandLevel"]
            }
          },
          required: ["yieldPrediction", "confidenceScore", "sustainabilityScore", "limitingFactors", "recommendations", "marketAnalysis"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Empty response from AI");

    const parsedData = JSON.parse(cleanJson(resultText));

    return {
      ...parsedData,
      inputSummary: data
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return simulatePrediction(data);
  }
};

/**
 * Fallback Simulation Engine
 * Used when API key is missing or API call fails.
 */
function simulatePrediction(data: SoilData): PredictionResult {
  const { nitrogen, phosphorus, potassium, rainfall, temperature, cropType } = data;

  // 1. Baselines
  let baseYield = 4.0;
  if (cropType === 'Rice') baseYield = 5.0;
  else if (cropType === 'Wheat') baseYield = 3.5;
  else if (cropType === 'Maize') baseYield = 6.0;

  // 2. Nutrients Score
  const nScore = Math.max(0, 1 - Math.abs(nitrogen - 120) / 120);
  const pScore = Math.max(0, 1 - Math.abs(phosphorus - 60) / 60);
  const kScore = Math.max(0, 1 - Math.abs(potassium - 80) / 80);
  const nutrientFactor = (nScore + pScore + kScore) / 3;

  // 3. Climate Score
  const tempScore = Math.max(0, 1 - Math.abs(temperature - 25) / 15);
  const rainScore = Math.max(0, 1 - Math.abs(rainfall - 150) / 150);
  const climateFactor = (tempScore + rainScore) / 2;

  // 4. Result
  const predictedYield = baseYield * (0.5 + (nutrientFactor * 0.3) + (climateFactor * 0.2));
  const sustainability = Math.min(100, Math.max(40, (nutrientFactor * 60) + (climateFactor * 40)));
  const confidence = Math.floor(85 + (Math.random() * 10));

  // 5. Recommendations
  const recommendations = [];
  const limitingFactors = [];

  if (nitrogen < 100) {
    recommendations.push({
      title: "Nitrogen Deficiency",
      description: "Apply urea or ammonium nitrate to boost vegetative growth.",
      impact: "High",
      type: "nutrient"
    } as const);
    limitingFactors.push("Low Nitrogen");
  }

  if (rainfall < 50) {
    recommendations.push({
      title: "Drought Stress Mitigation",
      description: "Implement drip irrigation schedules immediately.",
      impact: "High",
      type: "irrigation"
    } as const);
    limitingFactors.push("Water Scarcity");
  }

  if (recommendations.length === 0) {
    recommendations.push({
      title: "Maintain Current Practices",
      description: "Conditions are optimal. Continue monitoring soil moisture.",
      impact: "Low",
      type: "general"
    } as const);
  }

  return {
    yieldPrediction: Number(predictedYield.toFixed(2)),
    confidenceScore: confidence,
    sustainabilityScore: Number(sustainability.toFixed(0)),
    limitingFactors: limitingFactors.length > 0 ? limitingFactors : ["None detected"],
    recommendations: recommendations,
    marketAnalysis: {
      trend: Math.random() > 0.5 ? "Up" : "Stable",
      estimatedPrice: `$${Math.floor(200 + Math.random() * 100)}/ton`,
      demandLevel: Math.random() > 0.6 ? "High" : "Medium"
    },
    inputSummary: data
  };
}
