import json
import sys

from predictor import get_predictor


def _read_payload() -> dict:
    # Prefer stdin to avoid Windows command-line length limits
    raw = ""
    try:
        if not sys.stdin.isatty():
            raw = sys.stdin.read()
    except Exception:
        raw = ""

    if raw and raw.lstrip().startswith("{"):
        payload = json.loads(raw)
    elif len(sys.argv) > 1:
        payload = json.loads(sys.argv[1])
    else:
        raise ValueError("No JSON payload provided")

    if not isinstance(payload, dict):
        raise ValueError("Request payload must be a JSON object")

    return payload


def main():
    try:
        payload = _read_payload()
        features = payload.get("features")
        if features is None or not isinstance(features, dict):
            raise ValueError("Payload must include a 'features' object with 8648 feature keys")

        predictor = get_predictor()
        result = predictor.predict_features(features)

        result.setdefault("meta", {})
        result["meta"].update(
            {
                "features_mode": True,
            }
        )

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
