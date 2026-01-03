"""
Test script for the ADNI predictor with various patient scenarios
"""
import json
import sys
import os

# Add parent directory to path to import adni_predictor
sys.path.insert(0, os.path.dirname(__file__))

from adni_predictor import get_predictor

def test_predictor():
    """Test the predictor with different patient scenarios"""
    
    print("=" * 60)
    print("ADNI Predictor Test Suite")
    print("=" * 60)
    
    # Initialize predictor
    try:
        predictor = get_predictor()
        print("\n✅ Predictor initialized successfully")
    except Exception as e:
        print(f"\n❌ Failed to initialize predictor: {e}")
        return
    
    # Test cases with different patient profiles
    test_cases = [
        {
            "name": "Healthy Patient (CN Expected)",
            "data": {
                'AGE': 65.0,
                'PTGENDER': 1,
                'PTEDUCAT': 16,
                'MMSE': 29.0,
                'Hippocampus': 8000.0,
                'WholeBrain': 1200000.0,
                'Entorhinal': 3800.0,
                'MidTemp': 21000.0,
                'APOE4': 0
            }
        },
        {
            "name": "MCI Patient (MCI Expected)",
            "data": {
                'AGE': 72.0,
                'PTGENDER': 0,
                'PTEDUCAT': 14,
                'MMSE': 26.0,
                'Hippocampus': 7200.0,
                'WholeBrain': 1100000.0,
                'Entorhinal': 3200.0,
                'MidTemp': 19000.0,
                'APOE4': 1
            }
        },
        {
            "name": "AD Patient (AD Expected)",
            "data": {
                'AGE': 78.0,
                'PTGENDER': 1,
                'PTEDUCAT': 12,
                'MMSE': 20.0,
                'Hippocampus': 6500.0,
                'WholeBrain': 1000000.0,
                'Entorhinal': 2800.0,
                'MidTemp': 17000.0,
                'APOE4': 2
            }
        },
        {
            "name": "Minimal Data (Basic Features Only)",
            "data": {
                'AGE': 70.0,
                'MMSE': 24.0,
                'Hippocampus': 7500.0
            }
        }
    ]
    
    # Run tests
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{'-' * 60}")
        print(f"Test Case {i}: {test_case['name']}")
        print(f"{'-' * 60}")
        print(f"Input Data: {json.dumps(test_case['data'], indent=2)}")
        
        try:
            result = predictor.predict(test_case['data'])
            
            print(f"\n✅ Prediction Result:")
            print(f"   Diagnosis: {result['prediction']}")
            print(f"   Confidence: {result['confidence']} ({result['confidence'] * 100:.2f}%)")
            print(f"\n   Probabilities:")
            for dx, prob in result['probabilities'].items():
                print(f"      {dx}: {prob} ({prob * 100:.2f}%)")
            
            print(f"\n   Risk Assessment:")
            print(f"      Level: {result['risk_assessment']['level']}")
            print(f"      Message: {result['risk_assessment']['message']}")
            
        except Exception as e:
            print(f"\n❌ Prediction failed: {str(e)}")
            import traceback
            traceback.print_exc()
    
    print("\n" + "=" * 60)
    print("Test Suite Complete")
    print("=" * 60)

if __name__ == "__main__":
    test_predictor()
