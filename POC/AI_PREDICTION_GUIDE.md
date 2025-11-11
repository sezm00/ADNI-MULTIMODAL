# AI Prediction Integration Guide

## Overview

This guide explains how to set up and use the AI-powered Alzheimer's prediction feature integrated into the dashboard.

## Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   React         │      │   Node.js        │      │   Python Flask  │
│   Frontend      │─────▶│   Backend        │─────▶│   ML Model API  │
│   (Port 3000)   │      │   (Port 5000)    │      │   (Port 5001)   │
└─────────────────┘      └──────────────────┘      └─────────────────┘
```

## Components

### 1. Python Flask API (`Model/test_model_api.py`)
- Loads the CatBoost Alzheimer's prediction model
- Provides REST API endpoints for predictions
- Runs on port 5001

### 2. Node.js Backend Proxy (`Backend/controllers/predictionController.js`)
- Acts as a proxy between frontend and Python API
- Handles request/response formatting
- Provides error handling and logging

### 3. React Frontend (`Frontend/src/components/PredictionForm.js`)
- User-friendly form for entering patient data
- Real-time prediction results display
- Risk level visualization

## Setup Instructions

### Step 1: Install Python Dependencies

```bash
cd ADNI-MULTIMODAL/Model
pip install -r requirements.txt
```

Required packages:
- Flask==3.0.0
- flask-cors==4.0.0
- joblib==1.3.2
- pandas==2.1.4
- scikit-learn==1.3.2
- numpy==1.26.2

### Step 2: Update Model Path

Edit `Model/test_model_api.py` line 8 to point to your model:

```python
model_path = r"E:\University\Year_3\Grad\ADNI_MULTIMODAL\Model\test_models\catboost_alzheimers_model.pkl"
```

### Step 3: Start Python Flask API

```bash
cd ADNI-MULTIMODAL/Model
python test_model_api.py
```

You should see:
```
🚀 Starting Alzheimer's Prediction API...
📍 Model path: [your model path]
🌐 API will run on http://localhost:5001
```

### Step 4: Start Node.js Backend

```bash
cd ADNI-MULTIMODAL/Backend
npm run dev
```

The backend should show:
```
🚀 Server running on port 5000
✅ MongoDB Connected Successfully
```

### Step 5: Start React Frontend

```bash
cd ADNI-MULTIMODAL/Frontend
npm start
```

The frontend will open at `http://localhost:3000`

## Using the Prediction Feature

### 1. Access the AI Prediction Tab

- Open the dashboard at `http://localhost:3000`
- Click on the "AI Prediction" button in the navigation bar

### 2. Enter Patient Data

Fill in the following fields:

- **Age**: Patient's age in years (e.g., 75)
- **Gender**: 0 for Female, 1 for Male
- **Education**: Years of education (e.g., 16)
- **APOE4 Status**: 0 for Negative, 1 for Positive
- **MMSE Score**: Mini-Mental State Examination score (0-30)
- **CDR Score**: Clinical Dementia Rating (0-3, can be 0.5 increments)

### 3. Get Prediction

Click "Predict Risk" button. The system will:
1. Send data to Node.js backend (port 5000)
2. Backend forwards to Python API (port 5001)
3. Python API runs the ML model
4. Results are displayed with:
   - Diagnosis (Alzheimer's Disease / Healthy)
   - Risk Level (Low / Moderate / High)
   - Probability percentage
   - Visual indicators

## API Endpoints

### Python Flask API (Port 5001)

#### GET `/health`
Check if the API is running and model is loaded.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

#### POST `/predict`
Make a prediction based on patient data.

**Request:**
```json
{
  "age": 75,
  "gender": 1,
  "education": 16,
  "apoe4": 1,
  "mmse": 24,
  "cdr": 0.5
}
```

**Response:**
```json
{
  "success": true,
  "prediction": 1,
  "probability": 0.75,
  "probability_percentage": 75.0,
  "risk_level": "High Risk",
  "risk_color": "red",
  "diagnosis": "Alzheimer's Disease"
}
```

#### GET `/model-info`
Get information about the loaded model.

### Node.js Backend (Port 5000)

#### GET `/api/predictions/health`
Check Python API health status.

#### POST `/api/predictions/predict`
Proxy endpoint for predictions.

#### GET `/api/predictions/model-info`
Get model information.

## Troubleshooting

### Error: "Python API is not responding"

**Cause**: Flask server is not running or wrong port

**Solution**:
1. Check if Python server is running on port 5001
2. Verify no firewall is blocking the port
3. Check console for Python errors

### Error: "Model not loaded"

**Cause**: Model file path is incorrect

**Solution**:
1. Verify the model path in `test_model_api.py`
2. Ensure the `.pkl` file exists
3. Check file permissions

### Error: "Failed to connect to prediction service"

**Cause**: Node.js backend is not running

**Solution**:
1. Start the Node.js backend on port 5000
2. Check if port 5000 is available
3. Verify CORS settings

### Error: "Authentication failed" (MongoDB)

**Cause**: MongoDB connection string is incorrect

**Solution**:
1. Check `.env` file in Backend folder
2. Verify MongoDB Atlas credentials
3. See `MONGODB_SETUP.md` for details

## Model Requirements

Your CatBoost model should:
- Accept the input features as a pandas DataFrame
- Have a `predict_proba()` method
- Return probabilities for binary classification
- Be saved as a `.pkl` file using joblib

Example model training code:
```python
from catboost import CatBoostClassifier
import joblib

# Train model
model = CatBoostClassifier()
model.fit(X_train, y_train)

# Save model
joblib.dump(model, 'catboost_alzheimers_model.pkl')
```

## Adding More Features

To add more input features to the prediction form:

### 1. Update PredictionForm.js

Add new form fields in `Frontend/src/components/PredictionForm.js`:

```javascript
<div className="space-y-2">
  <Label htmlFor="newFeature">New Feature Name</Label>
  <Input
    id="newFeature"
    name="newFeature"
    type="number"
    value={formData.newFeature}
    onChange={handleInputChange}
    placeholder="e.g., 100"
    required
  />
</div>
```

### 2. Update formData State

Add the new feature to the initial state:

```javascript
const [formData, setFormData] = useState({
  age: '',
  gender: '',
  // ... existing fields
  newFeature: ''  // Add this
});
```

### 3. Update Python API

Ensure your model accepts the new feature in `test_model_api.py`.

## Security Considerations

⚠️ **Important for Production:**

1. **Add Authentication**: Protect the prediction endpoints
2. **Rate Limiting**: Prevent API abuse
3. **Input Validation**: Validate all input data
4. **HTTPS**: Use SSL/TLS in production
5. **API Keys**: Secure the Python API with API keys
6. **Data Privacy**: Ensure HIPAA compliance for patient data

## Performance Optimization

- **Caching**: Cache model predictions for identical inputs
- **Load Balancing**: Use multiple Python API instances
- **Async Processing**: Use queues for batch predictions
- **Model Optimization**: Quantize or compress the model

## Monitoring

Monitor these metrics:
- Prediction response time
- API availability
- Model accuracy
- Error rates
- Resource usage (CPU, Memory)

## Support

For issues or questions:
1. Check the console logs (Browser, Node.js, Python)
2. Verify all three servers are running
3. Test each API endpoint individually
4. Review the error messages carefully

## Next Steps

- [ ] Add user authentication
- [ ] Save predictions to MongoDB
- [ ] Add prediction history view
- [ ] Implement batch predictions
- [ ] Add model versioning
- [ ] Create prediction reports
- [ ] Add email notifications for high-risk predictions
