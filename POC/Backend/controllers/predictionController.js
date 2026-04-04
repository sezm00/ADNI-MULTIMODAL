const axios = require('axios');

// Python Flask API URL
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:5001';

// @desc    Get Python API health status
// @route   GET /api/predictions/health
// @access  Public
exports.getHealth = async (req, res) => {
  try {
    const response = await axios.get(`${PYTHON_API_URL}/health`);
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Python API is not available',
      error: error.message
    });
  }
};

// @desc    Get model information
// @route   GET /api/predictions/model-info
// @access  Public
exports.getModelInfo = async (req, res) => {
  try {
    const response = await axios.get(`${PYTHON_API_URL}/model-info`);
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get model information',
      error: error.message
    });
  }
};

// @desc    Make Alzheimer's prediction
// @route   POST /api/predictions/predict
// @access  Public (can be protected with auth middleware)
exports.makePrediction = async (req, res) => {
  try {
    const inputData = req.body;

    // Validate input data
    if (!inputData || Object.keys(inputData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide input features for prediction'
      });
    }

    // Call Python API
    const response = await axios.post(`${PYTHON_API_URL}/predict`, inputData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 seconds timeout
    });

    // Return prediction results
    res.json({
      success: true,
      data: response.data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Prediction error:', error.message);
    
    if (error.response) {
      // Python API returned an error
      return res.status(error.response.status).json({
        success: false,
        message: 'Prediction failed',
        error: error.response.data
      });
    } else if (error.request) {
      // Python API is not responding
      return res.status(503).json({
        success: false,
        message: 'Python API is not responding. Please ensure the Flask server is running on port 5001',
        error: error.message
      });
    } else {
      // Other errors
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
};

// @desc    Make Enhanced Alzheimer's prediction with dataset analysis
// @route   POST /api/predictions/predict-enhanced
// @access  Public
exports.makeEnhancedPrediction = async (req, res) => {
  try {
    const inputData = req.body;

    // Validate input data
    if (!inputData || Object.keys(inputData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide input features for prediction'
      });
    }

    // Call Python API enhanced endpoint
    const response = await axios.post(`${PYTHON_API_URL}/predict-enhanced`, inputData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 seconds timeout
    });

    // Return enhanced prediction results
    res.json({
      success: true,
      data: response.data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Enhanced prediction error:', error.message);
    
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: 'Enhanced prediction failed',
        error: error.response.data
      });
    } else if (error.request) {
      return res.status(503).json({
        success: false,
        message: 'Python API is not responding. Please ensure the Flask server is running on port 5001',
        error: error.message
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
};

// @desc    Get dataset information and statistics
// @route   GET /api/predictions/dataset-info
// @access  Public
exports.getDatasetInfo = async (req, res) => {
  try {
    const response = await axios.get(`${PYTHON_API_URL}/dataset-info`);
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get dataset information',
      error: error.message
    });
  }
};

// @desc    Save prediction to database (optional)
// @route   POST /api/predictions/save
// @access  Private
exports.savePrediction = async (req, res) => {
  try {
    const { patientId, inputData, predictionResult } = req.body;

    // Here you can save the prediction to MongoDB
    // For now, just return success
    res.json({
      success: true,
      message: 'Prediction saved successfully',
      data: {
        patientId,
        inputData,
        predictionResult,
        savedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to save prediction',
      error: error.message
    });
  }
};
