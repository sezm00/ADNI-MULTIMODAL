const express = require('express');
const router = express.Router();
const https = require('https');
const { auth, isDoctor } = require('../middleware/auth');
const auditLog = require('../middleware/auditLog');

const MODEL_VERSION = '2.0.0';
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
let activeModel = process.env.MODEL_NAME || 'xgb_model_top15';

const ML_TIMEOUT_MS = 60_000;       // fused requests with CNN can be slow on CPU
const OPENAI_TIMEOUT_MS = 30_000;
const OPENAI_RETRIES = 1;           // retry once on timeout

// ── GET /api/predict/model ────────────────────────────────────────────────────
router.get('/model', auth, (req, res) => {
  res.json({ success: true, model: { name: activeModel, version: MODEL_VERSION } });
});

// ── PUT /api/predict/model ────────────────────────────────────────────────────
router.put('/model', auth, isDoctor, (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ success: false, message: 'Model name is required' });
  }
  activeModel = name.trim();
  console.log(`[Model] Switched to: ${activeModel}`);
  res.json({ success: true, message: `Active model updated to ${activeModel}`, model: { name: activeModel, version: MODEL_VERSION } });
});

// ── GET /api/predict/health ───────────────────────────────────────────────────
router.get('/health', async (_req, res) => {
  try {
    const r = await fetch(`${ML_SERVICE_URL}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    const data = await r.json();
    res.json({ success: true, mlService: data });
  } catch (err) {
    res.status(502).json({ success: false, message: 'ML service unreachable', error: err.message });
  }
});

// ── POST /api/predict (tabular only) ──────────────────────────────────────────
router.post('/', auth, auditLog, async (req, res) => {
  const patientData = req.body;

  const coreFields = ['CDRSB', 'MMSE_bl', 'ADAS13'];
  const missingCore = coreFields.filter(f => !(f in patientData));
  if (missingCore.length === coreFields.length) {
    return res.status(400).json({
      success: false,
      message: `At least one core field required: ${coreFields.join(', ')}`,
    });
  }

  try {
    const prediction = await callMlService('/predict/tabular', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData),
    });

    const aiRecommendations = await safeOpenAIInsights(patientData, prediction);

    return res.json({
      success: true,
      prediction,
      aiRecommendations,
      modelInfo: { name: activeModel, version: MODEL_VERSION, mode: 'tabular' },
    });
  } catch (err) {
    return handleMlError(res, err, 'Tabular prediction failed');
  }
});

// ── POST /api/predict/fused (tabular + optional DICOM zip) ────────────────────
//
// Body: multipart/form-data with
//   tabular  (text) — JSON-encoded patient features
//   scan     (file, optional) — DICOM .zip archive
//
// The Express layer pipes the raw multipart stream to the FastAPI sidecar
// without re-parsing, so no multer dependency is needed.
router.post('/fused', auth, auditLog, async (req, res) => {
  const contentType = req.headers['content-type'] || '';
  if (!contentType.startsWith('multipart/form-data')) {
    return res.status(400).json({
      success: false,
      message: "POST /api/predict/fused expects multipart/form-data with 'tabular' field and optional 'scan' file",
    });
  }

  let prediction;
  try {
    prediction = await proxyMultipart(req, '/predict/fused');
  } catch (err) {
    return handleMlError(res, err, 'Fused prediction failed');
  }

  // OpenAI insights: read tabular fields from the X-Tabular-Data header so we
  // don't have to re-parse the multipart body the FastAPI sidecar already
  // consumed. Skip silently if the client didn't send it.
  let aiRecommendations = null;
  const tabularHeader = req.headers['x-tabular-data'];
  if (tabularHeader) {
    try {
      const patientData = JSON.parse(tabularHeader);
      aiRecommendations = await safeOpenAIInsights(patientData, prediction);
    } catch (e) {
      console.warn('Could not parse X-Tabular-Data header:', e.message);
    }
  }

  return res.json({
    success: true,
    prediction,
    aiRecommendations,
    modelInfo: { name: 'fused_model', version: MODEL_VERSION, mode: prediction.modelInfo?.mode || 'fused' },
  });
});

// ── helpers ───────────────────────────────────────────────────────────────────

async function callMlService(pathname, init) {
  const r = await fetch(`${ML_SERVICE_URL}${pathname}`, {
    ...init,
    signal: AbortSignal.timeout(ML_TIMEOUT_MS),
  });
  const text = await r.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    throw Object.assign(new Error('Invalid response from ML service'), { status: 502, body: text });
  }
  if (!r.ok) {
    throw Object.assign(new Error(payload.detail || payload.message || 'ML service error'), {
      status: r.status,
      body: payload,
    });
  }
  return payload;
}

async function proxyMultipart(req, pathname) {
  // Forward the inbound multipart stream verbatim — Node 18+ supports passing
  // a ReadableStream-like body with `duplex: 'half'`.
  const r = await fetch(`${ML_SERVICE_URL}${pathname}`, {
    method: 'POST',
    headers: {
      'Content-Type': req.headers['content-type'],
      ...(req.headers['content-length'] ? { 'Content-Length': req.headers['content-length'] } : {}),
    },
    body: req,
    duplex: 'half',
    signal: AbortSignal.timeout(ML_TIMEOUT_MS),
  });
  const text = await r.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    throw Object.assign(new Error('Invalid response from ML service'), { status: 502, body: text });
  }
  if (!r.ok) {
    throw Object.assign(new Error(payload.detail || payload.message || 'ML service error'), {
      status: r.status,
      body: payload,
    });
  }
  return payload;
}

function handleMlError(res, err, fallbackMessage) {
  console.error(`[predict] ${fallbackMessage}:`, err.message);
  const status = err.name === 'TimeoutError' || err.name === 'AbortError'
    ? 504
    : (err.status && err.status >= 400 && err.status < 600 ? err.status : 502);
  return res.status(status).json({
    success: false,
    message: status === 504 ? 'Prediction timed out' : fallbackMessage,
    error: err.message,
  });
}

async function safeOpenAIInsights(patientData, prediction) {
  let lastErr;
  for (let attempt = 0; attempt <= OPENAI_RETRIES; attempt++) {
    try {
      return await getOpenAIInsights(patientData, prediction);
    } catch (aiErr) {
      lastErr = aiErr;
      const willRetry = attempt < OPENAI_RETRIES && /timed out/i.test(aiErr.message);
      console.warn(`OpenAI API warning (attempt ${attempt + 1}):`, aiErr.message, willRetry ? '— retrying' : '');
      if (!willRetry) break;
    }
  }
  return null;
}

// ── OpenAI API helper ─────────────────────────────────────────────────────────
function getOpenAIInsights(patientData, predictionResult) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return Promise.reject(new Error('OPENAI_API_KEY is not configured'));

  const diagLabel = {
    CN:       'Cognitively Normal (CN)',
    MCI:      'Mild Cognitive Impairment (MCI)',
    Dementia: "Alzheimer's Disease / Dementia",
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
      { role: 'user',   content: userPrompt },
    ],
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(requestBody),
      },
    };

    const req = https.request(options, (resp) => {
      let data = '';
      resp.on('data', chunk => { data += chunk; });
      resp.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) reject(new Error(parsed.error.message));
          else              resolve(parsed.choices[0].message.content);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.setTimeout(OPENAI_TIMEOUT_MS, () => {
      req.destroy();
      reject(new Error('OpenAI request timed out after 15s'));
    });

    req.on('error', reject);
    req.write(requestBody);
    req.end();
  });
}

module.exports = router;
