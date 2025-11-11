import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Brain, AlertCircle, CheckCircle, Loader } from 'lucide-react';

const PredictionForm = () => {
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    education: '',
    apoe4: '',
    mmse: '',
    cdr: '',
    // Add more fields as required by your model
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      // Convert form data to numbers
      const numericData = {};
      Object.keys(formData).forEach(key => {
        numericData[key] = parseFloat(formData[key]) || 0;
      });

      // Call the Node.js backend API
      const response = await fetch('http://localhost:5000/api/predictions/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(numericData)
      });

      const result = await response.json();

      if (result.success) {
        setPrediction(result.data);
      } else {
        setError(result.message || 'Prediction failed');
      }
    } catch (err) {
      setError('Failed to connect to prediction service. Please ensure both Node.js and Python servers are running.');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Low Risk':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Moderate Risk':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'High Risk':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white border-none shadow-xl">
        <CardHeader className="bg-gradient-to-r from-pink-50 via-white to-purple-50 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-pink-500 p-3 rounded-lg shadow-md">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-gray-800 text-xl font-bold">AI Prediction</CardTitle>
              <CardDescription className="text-gray-500 text-sm">
                Enter patient data to predict Alzheimer's risk
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Age */}
              <div className="space-y-2">
                <Label htmlFor="age" className="text-sm font-semibold text-gray-700">
                  Age (years)
                </Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="e.g., 75"
                  required
                  className="border-gray-300 focus:border-pink-500 focus:ring-pink-500"
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-semibold text-gray-700">
                  Gender (0=Female, 1=Male)
                </Label>
                <Input
                  id="gender"
                  name="gender"
                  type="number"
                  value={formData.gender}
                  onChange={handleInputChange}
                  placeholder="0 or 1"
                  min="0"
                  max="1"
                  required
                  className="border-gray-300 focus:border-pink-500 focus:ring-pink-500"
                />
              </div>

              {/* Education */}
              <div className="space-y-2">
                <Label htmlFor="education" className="text-sm font-semibold text-gray-700">
                  Education (years)
                </Label>
                <Input
                  id="education"
                  name="education"
                  type="number"
                  value={formData.education}
                  onChange={handleInputChange}
                  placeholder="e.g., 16"
                  required
                  className="border-gray-300 focus:border-pink-500 focus:ring-pink-500"
                />
              </div>

              {/* APOE4 */}
              <div className="space-y-2">
                <Label htmlFor="apoe4" className="text-sm font-semibold text-gray-700">
                  APOE4 Status (0=Negative, 1=Positive)
                </Label>
                <Input
                  id="apoe4"
                  name="apoe4"
                  type="number"
                  value={formData.apoe4}
                  onChange={handleInputChange}
                  placeholder="0 or 1"
                  min="0"
                  max="1"
                  required
                  className="border-gray-300 focus:border-pink-500 focus:ring-pink-500"
                />
              </div>

              {/* MMSE */}
              <div className="space-y-2">
                <Label htmlFor="mmse" className="text-sm font-semibold text-gray-700">
                  MMSE Score (0-30)
                </Label>
                <Input
                  id="mmse"
                  name="mmse"
                  type="number"
                  value={formData.mmse}
                  onChange={handleInputChange}
                  placeholder="e.g., 24"
                  min="0"
                  max="30"
                  required
                  className="border-gray-300 focus:border-pink-500 focus:ring-pink-500"
                />
              </div>

              {/* CDR */}
              <div className="space-y-2">
                <Label htmlFor="cdr" className="text-sm font-semibold text-gray-700">
                  CDR Score (0-3)
                </Label>
                <Input
                  id="cdr"
                  name="cdr"
                  type="number"
                  step="0.5"
                  value={formData.cdr}
                  onChange={handleInputChange}
                  placeholder="e.g., 0.5"
                  min="0"
                  max="3"
                  required
                  className="border-gray-300 focus:border-pink-500 focus:ring-pink-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-lg shadow-md font-semibold transition-all"
              >
                {loading ? (
                  <>
                    <Loader className="h-5 w-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-5 w-5 mr-2" />
                    Predict Risk
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-800">Error</h4>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Prediction Results */}
          {prediction && (
            <div className="mt-6 space-y-4">
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-xl border-2 border-pink-200 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Prediction Results</h3>
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Diagnosis */}
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <p className="text-sm text-gray-600 mb-2">Diagnosis</p>
                    <p className="text-2xl font-bold text-gray-800">{prediction.diagnosis}</p>
                  </div>

                  {/* Risk Level */}
                  <div className={`p-4 rounded-lg shadow-md border-2 ${getRiskColor(prediction.risk_level)}`}>
                    <p className="text-sm mb-2 opacity-75">Risk Level</p>
                    <p className="text-2xl font-bold">{prediction.risk_level}</p>
                  </div>

                  {/* Probability */}
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <p className="text-sm text-gray-600 mb-2">Probability</p>
                    <div className="flex items-baseline space-x-2">
                      <p className="text-3xl font-bold text-pink-500">
                        {prediction.probability_percentage?.toFixed(1)}%
                      </p>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-pink-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${prediction.probability_percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Prediction Class */}
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <p className="text-sm text-gray-600 mb-2">Classification</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {prediction.prediction === 1 ? 'Positive' : 'Negative'}
                    </p>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> This prediction is based on AI analysis and should be used as a 
                    supplementary tool. Always consult with healthcare professionals for proper diagnosis and treatment.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-800 text-lg">About the Prediction Model</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-700">
            <p><strong>MMSE (Mini-Mental State Examination):</strong> A 30-point questionnaire used to measure cognitive impairment (0-30, higher is better)</p>
            <p><strong>CDR (Clinical Dementia Rating):</strong> A scale used to characterize dementia severity (0=Normal, 0.5=Very Mild, 1=Mild, 2=Moderate, 3=Severe)</p>
            <p><strong>APOE4:</strong> A genetic risk factor for Alzheimer's disease</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictionForm;
