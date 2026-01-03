"""
Comprehensive test with diverse patient inputs
Testing extreme cases, edge cases, and varied scenarios
"""
import json
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))
from simplified_predictor import get_predictor

def test_diverse_scenarios():
    """Test with very diverse patient profiles"""
    
    print("=" * 70)
    print("COMPREHENSIVE PREDICTOR TEST - DIVERSE INPUTS")
    print("=" * 70)
    
    predictor = get_predictor()
    print("\n✅ Predictor initialized\n")
    
    test_cases = [
        {
            "name": "Very Healthy Young Patient",
            "description": "Young, high MMSE, excellent brain volumes, no APOE4",
            "data": {
                'AGE': 55.0,
                'PTGENDER': 1,
                'PTEDUCAT': 18,
                'MMSE': 30.0,
                'Hippocampus': 8500.0,
                'WholeBrain': 1300000.0,
                'Entorhinal': 4200.0,
                'MidTemp': 23000.0,
                'APOE4': 0
            }
        },
        {
            "name": "Severe AD Profile",
            "description": "Old, very low MMSE, severe atrophy, APOE4 homozygous",
            "data": {
                'AGE': 85.0,
                'PTGENDER': 1,
                'PTEDUCAT': 8,
                'MMSE': 12.0,
                'Hippocampus': 5000.0,
                'WholeBrain': 900000.0,
                'Entorhinal': 2000.0,
                'MidTemp': 15000.0,
                'APOE4': 2
            }
        },
        {
            "name": "Borderline MCI",
            "description": "Moderate age, borderline MMSE, some atrophy",
            "data": {
                'AGE': 70.0,
                'PTGENDER': 0,
                'PTEDUCAT': 16,
                'MMSE': 27.0,
                'Hippocampus': 7000.0,
                'WholeBrain': 1050000.0,
                'Entorhinal': 3000.0,
                'MidTemp': 18500.0,
                'APOE4': 1
            }
        },
        {
            "name": "Young with Low MMSE",
            "description": "Young but very low cognitive scores",
            "data": {
                'AGE': 60.0,
                'PTGENDER': 1,
                'PTEDUCAT': 12,
                'MMSE': 15.0,
                'Hippocampus': 6000.0,
                'WholeBrain': 950000.0,
                'Entorhinal': 2500.0,
                'MidTemp': 16000.0,
                'APOE4': 2
            }
        },
        {
            "name": "Old but Healthy",
            "description": "Old age but excellent cognitive and brain health",
            "data": {
                'AGE': 82.0,
                'PTGENDER': 0,
                'PTEDUCAT': 20,
                'MMSE': 29.0,
                'Hippocampus': 8200.0,
                'WholeBrain': 1250000.0,
                'Entorhinal': 4000.0,
                'MidTemp': 22000.0,
                'APOE4': 0
            }
        },
        {
            "name": "Extreme Atrophy",
            "description": "Extremely small brain volumes",
            "data": {
                'AGE': 75.0,
                'PTGENDER': 1,
                'PTEDUCAT': 14,
                'MMSE': 18.0,
                'Hippocampus': 4500.0,
                'WholeBrain': 850000.0,
                'Entorhinal': 1800.0,
                'MidTemp': 14000.0,
                'APOE4': 1
            }
        },
        {
            "name": "High Education, Good Volumes",
            "description": "Very high education with good brain reserve",
            "data": {
                'AGE': 68.0,
                'PTGENDER': 0,
                'PTEDUCAT': 22,
                'MMSE': 28.0,
                'Hippocampus': 8000.0,
                'WholeBrain': 1200000.0,
                'Entorhinal': 3900.0,
                'MidTemp': 21500.0,
                'APOE4': 0
            }
        },
        {
            "name": "Mixed Profile",
            "description": "Some good, some bad indicators",
            "data": {
                'AGE': 73.0,
                'PTGENDER': 1,
                'PTEDUCAT': 16,
                'MMSE': 25.0,
                'Hippocampus': 7500.0,
                'WholeBrain': 1100000.0,
                'Entorhinal': 3200.0,
                'MidTemp': 19000.0,
                'APOE4': 1
            }
        },
        {
            "name": "Only Age and MMSE",
            "description": "Minimal data - just age and MMSE",
            "data": {
                'AGE': 70.0,
                'MMSE': 20.0
            }
        },
        {
            "name": "Perfect Score Young",
            "description": "Perfect MMSE, young, no genetic risk",
            "data": {
                'AGE': 50.0,
                'MMSE': 30.0,
                'APOE4': 0
            }
        }
    ]
    
    results = []
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{'─' * 70}")
        print(f"Test {i}/{len(test_cases)}: {test_case['name']}")
        print(f"{'─' * 70}")
        print(f"Description: {test_case['description']}")
        print(f"Input: {json.dumps(test_case['data'], indent=2)}")
        
        try:
            result = predictor.predict(test_case['data'])
            
            print(f"\n📊 RESULT:")
            print(f"   Diagnosis: {result['prediction']}")
            print(f"   Confidence: {result['confidence']:.4f} ({result['confidence']*100:.2f}%)")
            print(f"\n   Probabilities:")
            for dx, prob in sorted(result['probabilities'].items(), key=lambda x: x[1], reverse=True):
                bar = '█' * int(prob * 50)
                print(f"      {dx}: {prob:.4f} ({prob*100:5.2f}%) {bar}")
            
            print(f"\n   Risk: {result['risk_assessment']['level']}")
            
            results.append({
                'name': test_case['name'],
                'prediction': result['prediction'],
                'confidence': result['confidence'],
                'AD_prob': result['probabilities']['AD'],
                'CN_prob': result['probabilities']['CN'],
                'MCI_prob': result['probabilities']['MCI']
            })
            
        except Exception as e:
            print(f"\n❌ ERROR: {str(e)}")
            import traceback
            traceback.print_exc()
    
    # Summary
    print("\n" + "=" * 70)
    print("SUMMARY OF ALL PREDICTIONS")
    print("=" * 70)
    print(f"\n{'Test Case':<30} {'Prediction':<8} {'Confidence':<12} {'AD%':<8} {'CN%':<8} {'MCI%':<8}")
    print("─" * 70)
    
    for r in results:
        print(f"{r['name']:<30} {r['prediction']:<8} {r['confidence']*100:>5.2f}%      "
              f"{r['AD_prob']*100:>5.2f}%  {r['CN_prob']*100:>5.2f}%  {r['MCI_prob']*100:>5.2f}%")
    
    # Analysis
    print("\n" + "=" * 70)
    print("ANALYSIS")
    print("=" * 70)
    
    predictions = [r['prediction'] for r in results]
    print(f"\nPrediction Distribution:")
    print(f"  AD:  {predictions.count('AD')} cases")
    print(f"  CN:  {predictions.count('CN')} cases")
    print(f"  MCI: {predictions.count('MCI')} cases")
    
    avg_confidence = sum(r['confidence'] for r in results) / len(results)
    print(f"\nAverage Confidence: {avg_confidence*100:.2f}%")
    
    if predictions.count('MCI') == len(predictions):
        print("\n⚠️  WARNING: All predictions are MCI!")
        print("   This indicates the model is not properly distinguishing between cases.")
        print("   The model needs to be retrained with the actual features you're using.")
    else:
        print("\n✅ Model is producing varied predictions")

if __name__ == "__main__":
    test_diverse_scenarios()
