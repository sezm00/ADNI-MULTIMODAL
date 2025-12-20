const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');

// POST /api/predict - Get AI diagnosis prediction
router.post('/', async (req, res) => {
  try {
    const patientData = req.body;

    // Validate at least some core fields are present
    const coreFields = ['AGE', 'MMSE', 'Hippocampus'];
    const missingCoreFields = coreFields.filter(field => !(field in patientData));
    
    if (missingCoreFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing core required fields: ${missingCoreFields.join(', ')}`
      });
    }

    // Call Python predictor
    const pythonProcess = spawn('python', [
      path.join(__dirname, '..', 'predict.py'),
      JSON.stringify(patientData)
    ]);

    let outputData = '';
    let errorData = '';

    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python error:', errorData);
        return res.status(500).json({
          success: false,
          message: 'Prediction failed',
          error: errorData
        });
      }

      try {
        const result = JSON.parse(outputData);
        res.json({
          success: true,
          prediction: result
        });
      } catch (err) {
        console.error('Parse error:', err);
        res.status(500).json({
          success: false,
          message: 'Failed to parse prediction result'
        });
      }
    });

  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
