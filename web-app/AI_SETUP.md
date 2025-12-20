# AI Diagnosis Setup Instructions

## Step 1: Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

## Step 2: Add Model Files

Copy your model files to the `backend/models/` directory:

1. `best_adni_xgboost_model_phase_3.pkl` - Your trained XGBoost model
2. `label_encoder.pkl` (optional) - Label encoder for mapping predictions

```
backend/
  └── models/
      ├── best_adni_xgboost_model_phase_3.pkl
      └── label_encoder.pkl (optional)
```

## Step 3: Test the Predictor

Test the Python predictor directly:

```bash
cd backend
python
```

```python
from predictor import get_predictor

# Initialize predictor
predictor = get_predictor()

# Test prediction
test_patient = {
    'AGE': 82.5,
    'MMSE': 18.0,
    'Hippocampus': 2800.0,
    'APOE4': 1,
    'ADAS13': 35.0,
    'VISCODE_JOIN': 'm12'
}

result = predictor.predict(test_patient)
print(result)
```

## Step 4: Test the API Endpoint

With the backend server running:

```bash
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "AGE": 82.5,
    "MMSE": 18.0,
    "Hippocampus": 2800.0,
    "APOE4": 1,
    "ADAS13": 35.0,
    "VISCODE_JOIN": "m12"
  }'
```

## Step 5: Access the UI

1. Login as a patient: `patient@test.com` / `password123`
2. Click the lightbulb icon (second icon) in the sidebar
3. Enter patient biomarker data
4. Click "Get AI Diagnosis"

## Required Input Fields

- **AGE**: Patient age in years (e.g., 75.5)
- **MMSE**: Mini-Mental State Examination score (0-30)
- **Hippocampus**: Hippocampus volume in mm³ from MRI (e.g., 3500.5)
- **APOE4**: Number of APOE4 alleles (0, 1, or 2)
- **ADAS13**: Alzheimer's Disease Assessment Scale score
- **VISCODE_JOIN**: Visit code (bl, m06, m12, m24)

## Expected Output

```json
{
  "prediction": "AD",
  "confidence": 0.9854,
  "probabilities": {
    "AD": 0.9854,
    "CN": 0.0098,
    "MCI": 0.0048
  }
}
```

## Troubleshooting

### Model file not found
- Ensure `best_adni_xgboost_model_phase_3.pkl` is in `backend/models/`
- Check file permissions

### Python dependencies missing
- Run `pip install -r requirements.txt`
- Make sure you're using Python 3.8+

### Prediction errors
- Verify all input fields are numeric (except VISCODE_JOIN)
- Check that feature names match training data
- Review Python error logs in the terminal

## Notes

- The model expects the same feature engineering as during training
- One-hot encoding is applied automatically for categorical variables
- Missing features are filled with 0 (ensure this matches training preprocessing)
