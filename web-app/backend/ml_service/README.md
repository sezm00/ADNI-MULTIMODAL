# ALZ ForeSight ML Service

FastAPI sidecar that serves the XGBoost tabular model and the EfficientNet-B0 CNN, plus a late-fusion endpoint that combines them with the weights from `fused_model.joblib` (default 0.75 CNN / 0.25 XGB).

The Express backend (`web-app/backend/server.js`) proxies prediction requests to this service so heavy models stay warm in memory across requests.

## Endpoints

| Method | Path               | Body                                                      | Description                                                            |
| ------ | ------------------ | --------------------------------------------------------- | ---------------------------------------------------------------------- |
| GET    | `/health`          | —                                                         | Service + model status                                                 |
| POST   | `/predict/tabular` | JSON: 15 ADNI features                                    | XGBoost-only prediction                                                |
| POST   | `/predict/fused`   | multipart: `tabular` (JSON string) + optional `scan` (zip) | Fused if `scan` present, otherwise falls back to XGBoost-only          |

Response shape (all endpoints):

```json
{
  "prediction": "MCI",
  "confidence": 0.82,
  "probabilities": { "CN": 0.10, "Dementia": 0.08, "MCI": 0.82 },
  "modelInfo": { "name": "fused_model", "mode": "fused", "weights": { "cnn": 0.75, "xgb": 0.25 } },
  "components": { "cnn": { ... }, "xgboost": { ... } }
}
```

## Run locally

```bash
cd web-app/backend/ml_service
pip install -r requirements.txt
python main.py     # listens on :8000
```

Override paths with env vars: `XGB_MODEL_PATH`, `CNN_MODEL_PATH`, `FUSED_CONFIG_PATH`, `ML_SERVICE_PORT`.

## Express integration

`web-app/backend/routes/predict.js` calls this service via `ML_SERVICE_URL` (default `http://localhost:8000`):

- `POST /api/predict`        → `POST /predict/tabular`
- `POST /api/predict/fused`  → `POST /predict/fused` (streams the multipart body through)
- `GET  /api/predict/health` → `GET /health`
