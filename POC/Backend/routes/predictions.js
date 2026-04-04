const express = require('express');
const router = express.Router();
const {
  getHealth,
  getModelInfo,
  makePrediction,
  makeEnhancedPrediction,
  getDatasetInfo,
  savePrediction
} = require('../controllers/predictionController');

// Public routes
router.get('/health', getHealth);
router.get('/model-info', getModelInfo);
router.get('/dataset-info', getDatasetInfo);
router.post('/predict', makePrediction);
router.post('/predict-enhanced', makeEnhancedPrediction);

// Protected route (optional - add auth middleware if needed)
router.post('/save', savePrediction);

module.exports = router;
