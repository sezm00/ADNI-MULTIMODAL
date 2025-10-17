"""Run the enhanced API tests non-interactively.
This imports the functions from test_enhanced_api.py and runs them sequentially.
"""
import sys
import os

# Ensure current directory is the Model directory so imports work
here = os.path.dirname(__file__)
os.chdir(here)

import test_enhanced_api as tests

def main():
    print('\nRunning enhanced API tests (non-interactive)')
    results = []
    results.append(("Health Check", tests.test_health()))
    results.append(("Dataset Info", tests.test_dataset_info()))
    results.append(("Enhanced Prediction", tests.test_enhanced_prediction()))
    results.append(("Standard Prediction", tests.test_standard_prediction()))

    print('\nTEST SUMMARY')
    passed = 0
    for name, ok in results:
        status = '✅ PASSED' if ok else '❌ FAILED'
        print(f"{name}: {status}")
        if ok:
            passed += 1

    total = len(results)
    print(f"\nTotal: {passed}/{total} tests passed")

    # exit code 0 if all passed, else 1
    sys.exit(0 if passed == total else 1)

if __name__ == '__main__':
    main()
