from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import os
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Pipeline (Preprocessor + XGBoost)
MODEL_PATH = os.path.join(os.path.dirname(__file__), "xgb_pipeline.joblib")
pipeline = None

def load_model():
    global pipeline
    try:
        pipeline = joblib.load(MODEL_PATH)
        print("XGBoost Pipeline Loaded (User Schema)")
    except Exception as e:
        print(f"Error loading pipeline: {e}")

load_model()

class UserDatasetInput(BaseModel):
    Area: str
    Item: str
    average_rain: float
    avg_temp: float
    pesticides_tonnes: float
    Year: int = datetime.now().year

@app.get("/")
def read_root():
    return {"status": "AgriVision Custom Data Model Online"}

@app.post("/predict")
def predict_yield(data: UserDatasetInput):
    if not pipeline:
        load_model()
        if not pipeline:
            raise HTTPException(status_code=500, detail="Model not initialized. Run train_model.py")

    # Construct DataFrame
    input_df = pd.DataFrame([{
        'Year': data.Year,
        'average_rain': data.average_rain,
        'pesticides_tonnes': data.pesticides_tonnes,
        'avg_temp': data.avg_temp,
        'Area': data.Area,
        'Item': data.Item
    }])

    try:
        prediction = pipeline.predict(input_df)[0]
        prediction = max(0.0, float(prediction))
        return {
            "yield_prediction": prediction,
            "units": "hg/ha",
            "model": "XGBoost Custom Pipeline"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class TrainingData(UserDatasetInput):
    yield_actual: float

@app.post("/add-data")
def add_training_data(data: TrainingData):
    """
    Appends new data to the CSV and triggers a quick retrain.
    """
    try:
        csv_path = os.path.join(os.path.dirname(__file__), "agricultural_data.csv")
        
        new_row = {
            'Year': data.Year,
            'average_rain': data.average_rain,
            'pesticides_tonnes': data.pesticides_tonnes,
            'avg_temp': data.avg_temp,
            'Area': data.Area,
            'Item': data.Item,
            'hg/ha_yield': data.yield_actual
        }
        
        # Append to CSV
        df = pd.DataFrame([new_row])
        # If file doesn't exist, create it with header. If it does, append without header.
        header = not os.path.exists(csv_path)
        df.to_csv(csv_path, mode='a', header=header, index=False)
        
        # Trigger Retrain
        from train_model import train_pipeline
        mse = train_pipeline()
        
        # Reload model in memory
        load_model()
        
        return {"status": "success", "message": "Data added and model retrained", "new_mse": mse}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    if not os.path.exists(MODEL_PATH):
        print("Model file not found. Please run 'python backend/train_model.py' first.")
    uvicorn.run(app, host="0.0.0.0", port=8000)
