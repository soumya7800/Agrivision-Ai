
export interface SoilData {
  country: string;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
  cropType?: string;
}

export interface Recommendation {
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  type: 'nutrient' | 'irrigation' | 'general';
}

export interface PredictionResult {
  yieldPrediction: number; // in tons/hectare
  confidenceScore: number; // 0-100
  sustainabilityScore: number; // 0-100
  limitingFactors: string[];
  recommendations: Recommendation[];
  marketAnalysis: {
    trend: 'Up' | 'Down' | 'Stable';
    estimatedPrice: string;
    demandLevel: 'High' | 'Medium' | 'Low';
  };
  inputSummary: SoilData;
}

export enum CropType {
  Rice = "Rice",
  Maize = "Maize",
  Chickpea = "Chickpea",
  KidneyBeans = "Kidney Beans",
  PigeonPeas = "Pigeon Peas",
  MothBeans = "Moth Beans",
  MungBean = "Mung Bean",
  Blackgram = "Blackgram",
  Lentil = "Lentil",
  Pomegranate = "Pomegranate",
  Banana = "Banana",
  Mango = "Mango",
  Grapes = "Grapes",
  Watermelon = "Watermelon",
  Muskmelon = "Muskmelon",
  Apple = "Apple",
  Orange = "Orange",
  Papaya = "Papaya",
  Coconut = "Coconut",
  Cotton = "Cotton",
  Jute = "Jute",
  Coffee = "Coffee"
}
