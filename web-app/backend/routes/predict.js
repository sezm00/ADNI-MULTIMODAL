const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');
const https = require('https');
const http = require('http');

// ── POST /api/predict ─────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const patientData = req.body;

    // At least one core cognitive score must be present
    const coreFields = ['CDRSB', 'MMSE_bl', 'ADAS13'];
    const missingCore = coreFields.filter(f => !(f in patientData));
    if (missingCore.length === coreFields.length) {
      return res.status(400).json({
        success: false,
        message: `At least one core field required: ${coreFields.join(', ')}`
      });
    }

    // ── Run Python predictor ──────────────────────────────────────────────────
    const pythonProcess = spawn('python3', [
      path.join(__dirname, '..', 'predict_top15.py'),
      JSON.stringify(patientData)
    ]);

    let outputData = '';
    let errorData  = '';
    pythonProcess.stdout.on('data', d => { outputData += d.toString(); });
    pythonProcess.stderr.on('data', d => { errorData  += d.toString(); });

    pythonProcess.on('close', async (code) => {
      if (code !== 0) {
        console.error('Python predictor error:', errorData);
        return res.status(500).json({
          success: false,
          message: 'Prediction failed',
          error: errorData
        });
      }

      let prediction;
      try {
        prediction = JSON.parse(outputData);
      } catch {
        return res.status(500).json({
          success: false,
          message: 'Failed to parse prediction output'
        });
      }

      // ── Call OpenAI API for AI Insights ──────────────────────────────────
      let aiRecommendations = null;
      try {
        aiRecommendations = await getOpenAIInsights(patientData, prediction);
      } catch (aiErr) {
        console.warn('OpenAI API warning:', aiErr.message);
        // Non-fatal: still return the prediction result
      }

      return res.json({
        success: true,
        prediction,
        aiRecommendations
      });
    });

  } catch (error) {
    console.error('Predict route error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// ── OpenAI API helper ─────────────────────────────────────────────────────────
async function getOpenAIInsights(patientData, predictionResult) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');

  const diagLabel = {
    CN:       'Cognitively Normal (CN)',
    MCI:      'Mild Cognitive Impairment (MCI)',
    Dementia: "Alzheimer's Disease / Dementia"
  }[predictionResult.prediction] || predictionResult.prediction;

  const fmt = (v) => (v !== undefined && v !== null && v !== '') ? v : 'N/A';
  const pct = (v) => `${(v * 100).toFixed(1)}%`;

  const userPrompt = `You are a clinical AI assistant supporting neurologists using the ADNI (Alzheimer's Disease Neuroimaging Initiative) dataset. An XGBoost model trained on ADNI data has produced the following assessment. Provide clear, evidence-based insights structured for both clinician review and patient communication.

## Patient Assessment Scores
| Measure | Value |
|---|---|
| CDR Sum of Boxes (CDRSB) | ${fmt(patientData.CDRSB)} |
| Baseline CDRSB | ${fmt(patientData.CDRSB_bl)} |
| FAQ (Functional Activities) | ${fmt(patientData.FAQ)} |
| ADAS-Cog 13 | ${fmt(patientData.ADAS13)} |
| Baseline MMSE | ${fmt(patientData.MMSE_bl)} |
| Logical Memory Delayed (LDELTOTAL_BL) | ${fmt(patientData.LDELTOTAL_BL)} |
| mPACCtrailsB | ${fmt(patientData.mPACCtrailsB)} |
| mPACCdigit | ${fmt(patientData.mPACCdigit)} |
| Study Protocol (ORIGPROT) | ${fmt(patientData.ORIGPROT)} |

## AI Model Output
- Predicted Diagnosis: ${diagLabel}
- Confidence: ${pct(predictionResult.confidence)}
- Class Probabilities: CN ${pct(predictionResult.probabilities.CN)} | MCI ${pct(predictionResult.probabilities.MCI)} | Dementia ${pct(predictionResult.probabilities.Dementia)}

Your response MUST use exactly these three delimiters on their own lines, with the content for each section immediately after:

##SECTION1##
2-3 sentences explaining what the predicted diagnosis and confidence level mean clinically. Reference the most significant scores (CDRSB, MMSE, FAQ) and what they reveal about the patient's cognitive state.

##SECTION2##
2-3 sentences explaining the clinical reasoning behind this outcome. Highlight which input values were most influential and how they align with ADNI diagnostic thresholds.

##SECTION3##
Write 3-4 concrete actions the patient can take right now. Cover: lifestyle changes, follow-up care, cognitive exercises, and social or mental health steps. Use plain language the patient can understand directly.

Do not add any text before ##SECTION1## or after the last section. Do not use numbered lists or bullet points. Keep total response under 300 words.`;

  const requestBody = JSON.stringify({
    model: 'gpt-4o',
    max_tokens: 600,
    messages: [
      { role: 'system', content: 'You are a clinical AI assistant supporting neurologists. Be concise, specific, and evidence-based.' },
      { role: 'user',   content: userPrompt }
    ]
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(requestBody)
      }
    };

    const req = https.request(options, (resp) => {
      let data = '';
      resp.on('data', chunk => { data += chunk; });
      resp.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            reject(new Error(parsed.error.message));
          } else {
            resolve(parsed.choices[0].message.content);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(requestBody);
    req.end();
  });
}

module.exports = router;
