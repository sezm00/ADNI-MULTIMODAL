import argparse
import json
import os
import sys

from adni_dataset import get_store
from predictor import get_predictor


def main():
    try:
        payload = {}

        # Mode 0 (preferred): stdin JSON (avoids Windows argv length/quoting issues)
        raw = ""
        try:
            if not sys.stdin.isatty():
                raw = sys.stdin.read()
        except Exception:
            raw = ""
        if raw and raw.lstrip().startswith("{"):
            payload = json.loads(raw)
            if not isinstance(payload, dict):
                raise ValueError("Request payload must be a JSON object")
        else:

            # Mode 1 (API legacy): argv[1] is a JSON object string
            if len(sys.argv) > 1 and str(sys.argv[1]).lstrip().startswith("{"):
                payload = json.loads(sys.argv[1])
                if not isinstance(payload, dict):
                    raise ValueError("Request payload must be a JSON object")
            else:
                # Mode 2 (CLI-friendly): parse flags
                parser = argparse.ArgumentParser(add_help=False)
                parser.add_argument("--rid", type=int)
                parser.add_argument("--viscode", type=str)
                parser.add_argument("--data-dir", type=str)
                args, _ = parser.parse_known_args()
                if args.rid is not None:
                    payload["RID"] = args.rid
                if args.viscode is not None:
                    payload["VISCODE"] = args.viscode
                if args.data_dir is not None:
                    payload["dataDir"] = args.data_dir

        rid = payload.get("RID")
        viscode = payload.get("VISCODE") or payload.get("VISCODE_JOIN") or payload.get("VISCODE_ptd")

        if rid is None or viscode is None:
            raise ValueError("RID and VISCODE are required for dataset-based prediction")

        data_dir = payload.get("dataDir") or os.environ.get("ADNI_DATA_DIR")
        if not data_dir:
            # Convenience default for local dev on Windows
            candidate = os.path.join(os.path.expanduser("~"), "Downloads", "ADNI_Datasets")
            if os.path.isdir(candidate):
                data_dir = candidate
        if not data_dir:
            raise ValueError("ADNI_DATA_DIR env var not set and no dataDir provided")

        store = get_store(data_dir)
        row = store.get_row(int(rid), str(viscode))

        # Merge: allow request to override any columns from dataset row
        patient_dict = row.to_dict()
        overrides = dict(payload)
        overrides.pop("dataDir", None)
        patient_dict.update(overrides)

        predictor = get_predictor()
        result = predictor.predict(patient_dict)

        result.setdefault("meta", {})
        result["meta"].update(
            {
                "dataset_mode": True,
                "dataset_dir": data_dir,
                "dataset_rid": int(rid),
                "dataset_viscode": str(viscode),
                "dataset_row_key_count": len(patient_dict.keys()),
            }
        )

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
