import sys
import json
from predictor import get_predictor

def main():
    try:
        # Get patient data from command line argument
        patient_data = json.loads(sys.argv[1])
        
        # Get predictor instance
        predictor = get_predictor()
        
        # Make prediction
        result = predictor.predict(patient_data)
        
        # Output result as JSON
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
