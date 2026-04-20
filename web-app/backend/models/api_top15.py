import pandas as pd
import numpy as np
import joblib
import re
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

MODEL_PATH = "xgb_model_top15.joblib"
ARTIFACTS = {
    "num_imputer": joblib.load("num_imputer.joblib"),
    "cat_imputer": joblib.load("cat_imputer.joblib"),
    "scaler": joblib.load("scaler.joblib"),
    "power_transformer": joblib.load("power_transformer.joblib"),
    "ordinal_encoder": joblib.load("ordinal_encoder.joblib"),
    "top_15": joblib.load("top_15_features.joblib")
}
model = joblib.load(MODEL_PATH)

app = FastAPI(title="ADNI Top-15 Prediction API")

class Top15Input(BaseModel):
    CDRSB: float
    CDRSB_bl: float
    FAQ: float
    PTCOGBEG: str
    mPACCtrailsB: float
    ORIGPROT: str
    LDELTOTAL_BL: float
    mPACCdigit_bl: float
    PTADDX: str
    mPACCdigit: float
    MMSE_bl: float
    mPACCtrailsB_bl: float
    FSVERSION_bl: str
    VISDATE_ptd: str
    ADAS13: float

def sanitize_names(columns):
    cleaned = []
    for col in columns:
        col = str(col).replace("[", "_").replace("]", "_").replace("<", "_lt_")
        col = re.sub(r"[ >,:;\\/(){}=\-.]", "_", col)
        cleaned.append(re.sub(r"_+", "_", col).strip("_"))
    return cleaned

@app.post("/predict")
async def predict(data: Top15Input):
    try:
        # Convert input to DataFrame
        input_df = pd.DataFrame([data.dict()])
        
        # Identify numeric vs categorical from the 15 features
        numeric_cols = input_df.select_dtypes(include=[np.number]).columns.tolist()
        categorical_cols = [c for c in input_df.columns if c not in numeric_cols]

        # --- REPLICATE PIPELINE ---
        
        # 1. Imputation
        input_df[numeric_cols] = ARTIFACTS["num_imputer"].transform(input_df[numeric_cols])
        if categorical_cols:
            input_df[categorical_cols] = ARTIFACTS["cat_imputer"].transform(input_df[categorical_cols])

        # 2. Skew Handling (Yeo-Johnson)
        # Apply only to the columns that were skewed in training
        skewed_cols = ARTIFACTS["power_transformer"].feature_names_in_
        present_skewed = [c for c in skewed_cols if c in input_df.columns]
        if present_skewed:
            input_df[present_skewed] = ARTIFACTS["power_transformer"].transform(input_df[present_skewed])

        # 3. Scaling
        input_df[numeric_cols] = ARTIFACTS["scaler"].transform(input_df[numeric_cols])

        # 4. Ordinal Encoding
        if categorical_cols:
            input_df[categorical_cols] = ARTIFACTS["ordinal_encoder"].transform(input_df[categorical_cols].astype(str))

        # 5. Sanitize Column Names for XGBoost
        input_df.columns = sanitize_names(input_df.columns)

        # 6. Align with model's expected Top 15 order
        # Note: We drop RID/EXAMDATE as they weren't features for the model
        final_input = input_df[sanitize_names(ARTIFACTS["top_15"])]

        # 7. Prediction
        prediction_idx = model.predict(final_input)[0]
        probabilities = model.predict_proba(final_input)[0].tolist()
        
        # Map index back to class (CN, MCI, Dementia)
        classes = ["CN", "Dementia", "MCI"] # Replace with your label_encoder.classes_
        
        return {
            "prediction": classes[prediction_idx],
            "confidence": max(probabilities),
            "all_probabilities": dict(zip(classes, probabilities))
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)