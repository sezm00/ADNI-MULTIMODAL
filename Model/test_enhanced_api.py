"""
Test script for Enhanced Alzheimer's Prediction API
Tests the dataset integration and enhanced prediction features
"""

import requests
import json

BASE_URL = "http://localhost:5001"

def test_health():
    """Test health endpoint"""
    print("\n" + "="*60)
    print("TEST 1: Health Check")
    print("="*60)
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_dataset_info():
    """Test dataset info endpoint"""
    print("\n" + "="*60)
    print("TEST 2: Dataset Information")
    print("="*60)
    try:
        response = requests.get(f"{BASE_URL}/dataset-info")
        print(f"Status Code: {response.status_code}")
        data = response.json()
        if data.get('success'):
            print(f"✅ Dataset loaded successfully")
            print(f"Total Patients: {data['data']['total_patients']}")
            print(f"Columns: {len(data['data']['columns'])}")
        else:
            print(f"❌ Failed: {data}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_enhanced_prediction():
    """Test enhanced prediction with dataset analysis"""
    print("\n" + "="*60)
    print("TEST 3: Enhanced Prediction")
    print("="*60)
    
    # Test data
    test_input = {
        "age": 75,
        "gender": 1,
        "education": 16,
        "apoe4": 1,
        "mmse": 24,
        "cdr": 0.5
    }
    
    print(f"Input Data: {json.dumps(test_input, indent=2)}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/predict-enhanced",
            json=test_input,
            headers={'Content-Type': 'application/json'}
        )
        print(f"\nStatus Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("\n✅ PREDICTION SUCCESSFUL!")
                print("\n--- Prediction Results ---")
                pred = data['prediction']
                print(f"Diagnosis: {pred['diagnosis']}")
                print(f"Risk Level: {pred['risk_level']}")
                print(f"Probability: {pred['probability_percentage']:.1f}%")
                
                print("\n--- Dataset Analysis ---")
                analysis = data.get('dataset_analysis', {})
                print(f"Total Patients in Dataset: {analysis.get('total_patients_in_dataset', 'N/A')}")
                
                if 'age_comparison' in analysis:
                    age_comp = analysis['age_comparison']
                    print(f"\nAge Analysis:")
                    print(f"  Your Age: {age_comp['user_age']}")
                    print(f"  Dataset Mean: {age_comp['dataset_mean_age']:.1f}")
                    print(f"  Percentile: {age_comp['percentile']:.1f}th")
                
                if 'mmse_comparison' in analysis:
                    mmse_comp = analysis['mmse_comparison']
                    print(f"\nMMSE Analysis:")
                    print(f"  Your MMSE: {mmse_comp['user_mmse']}")
                    print(f"  Dataset Mean: {mmse_comp['dataset_mean_mmse']:.1f}")
                    print(f"  Better than: {mmse_comp['percentile']:.1f}% of patients")
                
                if 'similar_patients' in analysis:
                    similar = analysis['similar_patients']
                    print(f"\nSimilar Patients:")
                    print(f"  Found: {similar['count']} similar patients")
                    if 'diagnosis_distribution' in similar:
                        print(f"  Distribution: {similar['diagnosis_distribution']}")
                
                print("\n--- Recommendations ---")
                recs = data.get('recommendations', [])
                for i, rec in enumerate(recs[:3], 1):
                    print(f"{i}. [{rec['category']}] {rec['title']}")
                    print(f"   {rec['description'][:80]}...")
                
                return True
            else:
                print(f"❌ Prediction failed: {data}")
                return False
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_standard_prediction():
    """Test standard prediction endpoint (backward compatibility)"""
    print("\n" + "="*60)
    print("TEST 4: Standard Prediction (Backward Compatibility)")
    print("="*60)
    
    test_input = {
        "age": 70,
        "gender": 0,
        "education": 12,
        "apoe4": 0,
        "mmse": 28,
        "cdr": 0
    }
    
    print(f"Input Data: {json.dumps(test_input, indent=2)}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/predict",
            json=test_input,
            headers={'Content-Type': 'application/json'}
        )
        print(f"\nStatus Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("\n✅ STANDARD PREDICTION SUCCESSFUL!")
                print(f"Diagnosis: {data['diagnosis']}")
                print(f"Risk Level: {data['risk_level']}")
                print(f"Probability: {data['probability_percentage']:.1f}%")
                return True
            else:
                print(f"❌ Failed: {data}")
                return False
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("\n" + "="*60)
    print("ENHANCED ALZHEIMER'S PREDICTION API - TEST SUITE")
    print("="*60)
    print("\nMake sure the enhanced API is running on http://localhost:5001")
    print("Start it with: python enhanced_model_api.py")
    
    input("\nPress Enter to start tests...")
    
    results = []
    
    # Run tests
    results.append(("Health Check", test_health()))
    results.append(("Dataset Info", test_dataset_info()))
    results.append(("Enhanced Prediction", test_enhanced_prediction()))
    results.append(("Standard Prediction", test_standard_prediction()))
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    for test_name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    total = len(results)
    passed = sum(1 for _, p in results if p)
    print(f"\nTotal: {passed}/{total} tests passed")
    print("="*60)
