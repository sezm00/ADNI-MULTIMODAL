import json
import random

from predictor import get_predictor


def main():
    p = get_predictor()

    rng = random.Random(42)

    # Search space: keep it to common, strong cognitive markers.
    ages = [60, 65, 68, 70, 72, 74, 76, 78, 80]
    educ = [8, 10, 12, 14, 16, 18]
    apoe4 = [0, 1, 2]

    mmse = [18, 19, 20, 21, 22, 23, 24, 25, 26, 27]
    cdrsb = [0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0]
    adas11 = [6, 8, 10, 12, 14, 16, 18, 20, 22, 24]
    adas13 = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 34]

    def sample_case():
        return {
            "AGE": rng.choice(ages),
            "PTEDUCAT": rng.choice(educ),
            "APOE4": rng.choice(apoe4),
            "MMSE": rng.choice(mmse),
            "CDRSB": rng.choice(cdrsb),
            "ADAS11": rng.choice(adas11),
            "ADAS13": rng.choice(adas13),
        }

    best = []  # list of (confidence, pred, probs, feats)

    iters = 6000
    for _ in range(iters):
        feats = sample_case()
        r = p.predict_features(feats)
        conf = float(r["confidence"])
        best.append((conf, r["prediction"], r["probabilities"], feats))

    best.sort(key=lambda x: x[0])

    out = {
        "searched": iters,
        "lowest": [
            {
                "confidence": conf,
                "prediction": pred,
                "probabilities": probs,
                "features": feats,
            }
            for conf, pred, probs, feats in best[:10]
        ],
    }

    print(json.dumps(out, indent=2))


if __name__ == "__main__":
    main()
