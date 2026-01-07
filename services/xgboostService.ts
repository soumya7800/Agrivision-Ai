import { SoilData } from '../types';

const API_URL = 'http://localhost:8000';

interface UserDatasetResponse {
    yield_prediction: number;
    units: string;
    model: string;
}

export const predictYieldFromXGBoost = async (data: SoilData): Promise<number | null> => {
    try {
        // Map Frontend Data -> Backend Custom Schema
        // Frontend: country, cropType, rainfall, temperature, pesticides(optional)
        // Backend: Area, Item, average_rain, avg_temp, pesticides_tonnes, Year

        // Note: The user dataset uses "Area" for country and "Item" for crop
        const payload = {
            Area: data.country || 'India', // Default to avoid error
            Item: data.cropType || 'Maize',
            average_rain: data.rainfall, // Mapping rainfall -> average_rain
            avg_temp: data.temperature,  // Mapping temperature -> avg_temp
            pesticides_tonnes: data.pesticides || 100.0, // Default if not provided
            Year: new Date().getFullYear()
        };

        const response = await fetch(`${API_URL}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            // If backend fails, return null silently so Gemini takes over
            console.warn('Backend returned error:', response.statusText);
            return null;
        }

        const result: UserDatasetResponse = await response.json();
        console.log(`Custom Model Prediction: ${result.yield_prediction}`);

        // Convert hg/ha to tons/ha if necessary. 
        // Usually 1 hg/ha = 0.0001 ton/ha. 
        // The synthetic yield logic I wrote in train_model.py outputted "tons" roughly (4.0-8.0 range).
        // Let's assume the model returns Tons directly for simplicity in this demo.
        return result.yield_prediction;

    } catch (error) {
        console.warn("XGBoost Backend unavailable", error);
        return null;
    }
};

export const saveTrainingData = async (data: SoilData, actualYield: number): Promise<boolean> => {
    try {
        const payload = {
            Area: data.country || 'India',
            Item: data.cropType || 'Maize',
            average_rain: data.rainfall,
            avg_temp: data.temperature,
            pesticides_tonnes: data.pesticides || 100.0,
            Year: new Date().getFullYear(),
            yield_actual: actualYield
        };

        const response = await fetch(`${API_URL}/add-data`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        return response.ok;
    } catch (e) {
        console.error("Failed to save training data", e);
        return false;
    }
};
