import sys
import json
from predictor import get_predictor


def _read_payload():
    raw = ""
    try:
        if not sys.stdin.isatty():
            raw = sys.stdin.read()
    except Exception:
        raw = ""

    if raw and raw.lstrip().startswith("{"):
        return json.loads(raw)
    if len(sys.argv) > 1:
        return json.loads(sys.argv[1])
    raise ValueError("No JSON payload provided")


def main():
    try:
        patient_data = _read_payload()
        predictor = get_predictor()
        result = predictor.predict(patient_data)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
