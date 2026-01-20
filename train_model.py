import pandas as pd
import numpy as np
import xgboost as xgb
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

CSV_PATH = os.path.join(os.path.dirname(__file__), "agricultural_data.csv")
MODEL_PATH = os.path.join(os.path.dirname(__file__), "xgb_pipeline.joblib")

def generate_synthetic_data_if_missing():
    if os.path.exists(CSV_PATH):
        print(f"Loading existing dataset from: {CSV_PATH}")
        return pd.read_csv(CSV_PATH)
    
    print("Generating new synthetic dataset...")
    # ... (Keep generation logic or simplify if CSV already exists) ...
    # For now, let's assume we want to PRESERVE the CSV if it exists
    # If not, generating a small seed one
    np.random.seed(42)
    n_samples = 100
    data = {
        'Year': np.random.randint(1990, 2025, n_samples),
        'average_rain': np.random.uniform(200, 3000, n_samples),
        'pesticides_tonnes': np.random.uniform(10, 5000, n_samples),
        'avg_temp': np.random.uniform(10, 35, n_samples),
        'Area': np.random.choice(['India', 'USA', 'China', 'Brazil'], n_samples),
        'Item': np.random.choice(['Maize', 'Rice', 'Wheat', 'Soybean'], n_samples),
        'hg/ha_yield': np.random.uniform(0.5, 12.0, n_samples)
    }
    df = pd.DataFrame(data)
    df.to_csv(CSV_PATH, index=False)
    return df

def train_pipeline():
    print("Starting Model Training...")
    
    # 1. Load Data
    df = generate_synthetic_data_if_missing()
    
    # 2. Build Pipeline (Preprocessing + Model)
    X = df.drop(columns=['hg/ha_yield'])
    y = df['hg/ha_yield']

    # Categorical columns need encoding
    categorical_features = ['Area', 'Item']
    numerical_features = ['Year', 'average_rain', 'pesticides_tonnes', 'avg_temp']

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', 'passthrough', numerical_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ])

    xgb_model = xgb.XGBRegressor(
        objective='reg:squarederror',
        n_estimators=100,
        learning_rate=0.1,
        max_depth=6
    )

    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', xgb_model)
    ])

    # 3. Train
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    pipeline.fit(X_train, y_train)

    # 4. Evaluate
    preds = pipeline.predict(X_test)
    mse = mean_squared_error(y_test, preds)
    print(f"Model MSE: {mse:.4f}")

    # 5. Save
    joblib.dump(pipeline, MODEL_PATH)
    print(f"Pipeline saved to {MODEL_PATH}")
    return mse

if __name__ == "__main__":
    train_pipeline()
