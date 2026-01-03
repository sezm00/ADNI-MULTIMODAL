const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');

// GET /api/predict/phase3/features - Return the 8648 feature names (and optional template)
router.get('/phase3/features', async (req, res) => {
  try {
    const wantTemplate = String(req.query.template || '').toLowerCase();
    const pythonScript = path.join(__dirname, '..', 'get_phase3_features.py');

    const args = [pythonScript];
    if (wantTemplate === '1' || wantTemplate === 'true' || wantTemplate === 'yes') {
      args.push('--template');
    }

    const pythonProcess = spawn('python', args, {
      timeout: 30000,
      windowsHide: true
    });

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
        console.error('Phase3 features process exited with code:', code);
        console.error('Python error output:', errorData);
        return res.status(500).json({
          success: false,
          message: 'Failed to retrieve phase3 feature names',
          error: errorData || 'Unknown error occurred'
        });
      }

      try {
        const result = JSON.parse(outputData);
        if (result.error) {
          return res.status(500).json({
            success: false,
            message: 'Failed to retrieve phase3 feature names',
            error: result.error
          });
        }

        return res.json({
          success: true,
          feature_count: result.feature_count,
          features: result.features,
          template: result.template,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        console.error('Failed to parse Python output:', outputData);
        console.error('Parse error:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to parse phase3 feature names',
          details: outputData.substring(0, 200)
        });
      }
    });

    pythonProcess.on('error', (err) => {
      console.error('Failed to start Python process:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to start phase3 feature process',
        error: err.message
      });
    });

  } catch (error) {
    console.error('Phase3 features endpoint error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/predict - Get AI diagnosis prediction
router.post('/', async (req, res) => {
  try {
    const patientData = req.body;

    // Dataset-backed inference must be explicitly requested.
    // This prevents accidental switching into dataset mode just because a RID exists.
    const useDataset = patientData && (patientData.useDataset === true || patientData.mode === 'dataset');
    const hasDatasetKeys = !!(useDataset && patientData && patientData.RID !== undefined && patientData.RID !== null && patientData.RID !== '' && (patientData.VISCODE || patientData.VISCODE_JOIN || patientData.VISCODE_ptd));
    const hasFeatureVector = patientData && patientData.features && typeof patientData.features === 'object' && !Array.isArray(patientData.features);

    // Choose model: default to phase3 (8648-feature) to use the full feature space.
    // Use ?model=simplified or { model: 'simplified' } to force simplified model.
    const requestedModel = (req.query.model || patientData?.model || 'phase3').toString().toLowerCase();
    const pythonScript = requestedModel === 'simplified'
      ? path.join(__dirname, '..', 'predict.py')
      : (hasFeatureVector
        ? path.join(__dirname, '..', 'predict_phase3_features.py')
        : (hasDatasetKeys
          ? path.join(__dirname, '..', 'predict_phase3_dataset.py')
          : path.join(__dirname, '..', 'predict_phase3.py')));

    // Log incoming request for debugging
    console.log('Prediction request received with data:', Object.keys(patientData));

    // Validate that we have at least some data
    if (!patientData || Object.keys(patientData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No patient data provided'
      });
    }

    // Optional: Check for recommended minimum fields (not strict requirement)
    const recommendedFields = ['AGE', 'MMSE', 'Hippocampus'];
    const hasRecommendedFields = recommendedFields.some(field => field in patientData);
    
    if (!hasRecommendedFields) {
      console.warn('Warning: None of the recommended core fields present:', recommendedFields);
    }

    // Call Python predictor with timeout
    const pythonProcess = spawn('python', [
      pythonScript
    ], {
      timeout: 30000, // 30 second timeout
      windowsHide: true
    });

    // Send request body over stdin to avoid Windows cmdline limits/quoting issues
    try {
      pythonProcess.stdin.write(JSON.stringify(patientData));
      pythonProcess.stdin.end();
    } catch (e) {
      // If stdin write fails, Python will exit and error will be handled below
      console.error('Failed to write payload to Python stdin:', e);
    }

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
        console.error('Python process exited with code:', code);
        console.error('Python error output:', errorData);
        return res.status(500).json({
          success: false,
          message: 'Prediction failed',
          error: errorData || 'Unknown error occurred'
        });
      }

      try {
        // Parse the Python output
        const result = JSON.parse(outputData);
        
        // Check if result contains an error
        if (result.error) {
          console.error('Prediction error from Python:', result.error);
          return res.status(500).json({
            success: false,
            message: 'Prediction error',
            error: result.error
          });
        }

        // Log successful prediction
        console.log('Prediction successful:', result.prediction);

        // Return enhanced response
        res.json({
          success: true,
          prediction: result.prediction,
          confidence: result.confidence,
          probabilities: result.probabilities,
          risk_assessment: result.risk_assessment,
          meta: result.meta,
          timestamp: new Date().toISOString()
        });

      } catch (err) {
        console.error('Failed to parse Python output:', outputData);
        console.error('Parse error:', err);
        res.status(500).json({
          success: false,
          message: 'Failed to parse prediction result',
          details: outputData.substring(0, 200) // First 200 chars for debugging
        });
      }
    });

    pythonProcess.on('error', (err) => {
      console.error('Failed to start Python process:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to start prediction process',
        error: err.message
      });
    });

  } catch (error) {
    console.error('Prediction endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
