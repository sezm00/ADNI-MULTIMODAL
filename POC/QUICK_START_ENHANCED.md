# Quick Start - Enhanced Dataset Integration

## What's New
Your Alzheimer's prediction system now analyzes user input against a dataset of **2,149 patients** to provide:
- Individual risk prediction
- Comparison with similar patients
- Statistical insights (age percentile, MMSE ranking)
- Personalized recommendations

## How to Run

### Start All Services
```bash
start-enhanced.bat
```

This will start:
1. Node.js Backend (port 5000)
2. Enhanced Python API with Dataset (port 5001)
3. React Frontend (port 3000)

## What You'll See

### When You Make a Prediction:

1. **Standard Results**
   - Diagnosis
   - Risk Level
   - Probability %
   - Classification

2. **Dataset Analysis** (NEW!)
   - Age comparison with 2,149 patients
   - MMSE score percentile ranking
   - Similar patient analysis (finds 20 most similar cases)
   - Dataset statistics

3. **Personalized Recommendations** (NEW!)
   - Risk-based medical advice
   - Cognitive health tips
   - Lifestyle recommendations
   - Diet and exercise guidance

## API Endpoints

### Enhanced Prediction
```
POST http://localhost:5000/api/predictions/predict-enhanced
```

### Dataset Info
```
GET http://localhost:5000/api/predictions/dataset-info
```

## Dataset Details
- **Location**: `Model/alzheimers_disease_data.csv`
- **Size**: 2,149 patients
- **Features**: 35 columns including Age, Gender, MMSE, Diagnosis, etc.
- **No missing values**: Complete dataset

## Features

### Age Analysis
Shows where your age falls in the dataset distribution

### MMSE Comparison
Ranks your cognitive score against all patients

### Similar Patients
Finds 20 most similar patients and shows their outcomes

### Risk Distribution
Shows overall Alzheimer's vs Healthy distribution in dataset

## Next Steps
1. Run `start-enhanced.bat`
2. Open http://localhost:3000
3. Enter patient data
4. Click "Predict Alzheimer's Risk"
5. View comprehensive results with dataset insights
