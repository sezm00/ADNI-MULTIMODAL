import argparse
import json
import sys

from predictor import get_predictor


def main():
    try:
        parser = argparse.ArgumentParser(add_help=False)
        parser.add_argument("--template", action="store_true")
        args, _ = parser.parse_known_args()

        predictor = get_predictor()
        features = list(predictor.model_features)

        payload = {
            "feature_count": len(features),
            "features": features,
        }

        if args.template:
            payload["template"] = {"features": {name: 0.0 for name in features}}

        print(json.dumps(payload))

    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
