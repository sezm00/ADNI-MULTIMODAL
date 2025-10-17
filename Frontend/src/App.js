import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Textarea } from './components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Clock, Activity, Pill, Brain, User, Phone, AlertCircle, Home, Menu, Loader, CheckCircle, LayoutGrid, MessageCircle, PieChart, Star, Settings, ChevronDown, Search, ClipboardList, X } from 'lucide-react';

export default function AlzheimerCareApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [predictionData, setPredictionData] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState('1');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  
  // AI Prediction form state
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    education: '',
    apoe4: '',
    mmse: '',
    cdr: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePredictionSubmit = async (e) => {
    e.preventDefault();
    setPredictionLoading(true);
    setPredictionError(null);
    setPredictionData(null);

    try {
      const numericData = {};
      Object.keys(formData).forEach(key => {
        numericData[key] = parseFloat(formData[key]) || 0;
      });

      // Use enhanced prediction endpoint with dataset analysis
      const response = await fetch('http://localhost:5000/api/predictions/predict-enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(numericData)
      });

      const result = await response.json();

      if (result.success) {
        setPredictionData(result.data);
      } else {
        setPredictionError(result.message || 'Prediction failed');
      }
    } catch (err) {
      setPredictionError('Failed to connect to prediction service. Please ensure both Node.js and Python servers are running.');
      console.error('Prediction error:', err);
    } finally {
      setPredictionLoading(false);
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

  // Mock data
  const patients = [
    { id: '1', name: 'Margaret Thompson', age: 72, diagnosis: 'Alzheimer\'s Disease', stage: 'Mild', caregiverId: 'C001' }
  ];

  const assessments = [
    { id: '1', patientId: '1', date: '2024-01-15', memoryScore: 72, cognitiveScore: 68, behaviorScore: 80, notes: 'Slight improvement in recall' },
    { id: '2', patientId: '1', date: '2024-02-15', memoryScore: 70, cognitiveScore: 65, behaviorScore: 78, notes: 'Stable condition' },
    { id: '3', patientId: '1', date: '2024-03-15', memoryScore: 68, cognitiveScore: 63, behaviorScore: 75, notes: 'Minor decline in memory' }
  ];

  const medications = [
    { id: '1', patientId: '1', name: 'Donepezil', dosage: '10mg', frequency: 'Daily', time: '08:00', lastTaken: '2024-03-20 08:00' },
    { id: '2', patientId: '1', name: 'Memantine', dosage: '20mg', frequency: 'Twice daily', time: '08:00, 20:00', lastTaken: '2024-03-20 20:00' }
  ];

  const activities = [
    { id: '1', patientId: '1', date: '2024-03-20', type: 'Physical Exercise', description: 'Morning walk in the park', duration: '30 mins', mood: 'Good' },
    { id: '2', patientId: '1', date: '2024-03-20', type: 'Cognitive Activity', description: 'Puzzle solving session', duration: '45 mins', mood: 'Excellent' }
  ];

  const appointments = [
    { id: '1', patientId: '1', date: '2024-03-25', time: '10:00', doctor: 'Dr. Sarah Johnson', type: 'Neurologist', notes: 'Quarterly review' },
    { id: '2', patientId: '1', date: '2024-04-10', time: '14:30', doctor: 'Dr. Michael Chen', type: 'Psychiatrist', notes: 'Behavioral assessment' }
  ];

  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  const patientAssessments = assessments.filter(a => a.patientId === selectedPatientId);
  const patientMedications = medications.filter(m => m.patientId === selectedPatientId);
  const patientActivities = activities.filter(a => a.patientId === selectedPatientId);
  const patientAppointments = appointments.filter(a => a.patientId === selectedPatientId);

  const chartData = patientAssessments.map(a => ({
    date: a.date,
    Memory: a.memoryScore,
    Cognitive: a.cognitiveScore,
    Behavior: a.behaviorScore
  }));

  const Sidebar = () => (
    <div className={`fixed left-0 top-0 h-full w-64 bg-purple-900 text-white flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-64'}`}>
      {/* Logo */}
      <div className="p-6 flex items-center space-x-3">
        <div className="bg-white p-2 rounded-lg">
          <Brain className="h-6 w-6 text-purple-900" />
        </div>
        <span className="text-xl font-bold">Remindly</span>
      </div>

      {/* Search */}
      <div className="px-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-300" />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-purple-800 text-white placeholder-purple-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
            activeTab === 'dashboard' ? 'bg-purple-800 text-white' : 'text-purple-200 hover:bg-purple-800 hover:text-white'
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-sm font-medium">Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('assessments')}
          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
            activeTab === 'assessments' ? 'bg-purple-800 text-white' : 'text-purple-200 hover:bg-purple-800 hover:text-white'
          }`}
        >
          <ClipboardList className="h-5 w-5" />
          <span className="text-sm font-medium">Assessments</span>
        </button>

        <button
          onClick={() => setActiveTab('medications')}
          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
            activeTab === 'medications' ? 'bg-purple-800 text-white' : 'text-purple-200 hover:bg-purple-800 hover:text-white'
          }`}
        >
          <Pill className="h-5 w-5" />
          <span className="text-sm font-medium">Medications</span>
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
            activeTab === 'appointments' ? 'bg-purple-800 text-white' : 'text-purple-200 hover:bg-purple-800 hover:text-white'
          }`}
        >
          <Calendar className="h-5 w-5" />
          <span className="text-sm font-medium">Appointments</span>
        </button>

        {/* Projects Section */}
        <div className="mt-2">
          <button
            onClick={() => setProjectsExpanded(!projectsExpanded)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg mb-1 text-purple-200 hover:bg-purple-800 hover:text-white transition-colors"
          >
            <div className="flex items-center space-x-3">
              <LayoutGrid className="h-5 w-5" />
              <span className="text-sm font-medium">Projects</span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${projectsExpanded ? 'transform rotate-180' : ''}`} />
          </button>

          {projectsExpanded && (
            <div className="ml-6 space-y-1">
              <button
                onClick={() => setActiveTab('project1')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeTab === 'project1' ? 'bg-purple-800 text-white' : 'text-purple-200 hover:bg-purple-800 hover:text-white'
                }`}
              >
                <div className="w-2 h-2 bg-blue-400 rounded-sm"></div>
                <span>Project 1</span>
              </button>
              <button
                onClick={() => setActiveTab('project2')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeTab === 'project2' ? 'bg-purple-800 text-white' : 'text-purple-200 hover:bg-purple-800 hover:text-white'
                }`}
              >
                <div className="w-2 h-2 bg-yellow-400 rounded-sm"></div>
                <span>Project 2</span>
              </button>
              <button
                onClick={() => setActiveTab('project3')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeTab === 'project3' ? 'bg-purple-800 text-white' : 'text-purple-200 hover:bg-purple-800 hover:text-white'
                }`}
              >
                <div className="w-2 h-2 bg-green-400 rounded-sm"></div>
                <span>Project 3</span>
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
            activeTab === 'analytics' ? 'bg-purple-800 text-white' : 'text-purple-200 hover:bg-purple-800 hover:text-white'
          }`}
        >
          <PieChart className="h-5 w-5" />
          <span className="text-sm font-medium">Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('starred')}
          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
            activeTab === 'starred' ? 'bg-purple-800 text-white' : 'text-purple-200 hover:bg-purple-800 hover:text-white'
          }`}
        >
          <Star className="h-5 w-5" />
          <span className="text-sm font-medium">Starred</span>
        </button>
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-purple-800">
        <button
          onClick={() => setActiveTab('user')}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg mb-1 text-purple-200 hover:bg-purple-800 hover:text-white transition-colors"
        >
          <User className="h-5 w-5" />
          <span className="text-sm font-medium">User</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-purple-200 hover:bg-purple-800 hover:text-white transition-colors"
        >
          <Settings className="h-5 w-5" />
          <span className="text-sm font-medium">Settings</span>
        </button>
      </div>
    </div>
  );

  const DashboardView = () => (
    <div className="space-y-6">
      {/* AI Prediction Section - Main Focus */}
      <Card className="bg-gradient-to-br from-purple-50 via-purple-100 to-pink-50 border border-gray-300 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-purple-700 via-purple-600 to-pink-500 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-3 rounded-lg shadow-md">
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">AI-Powered Alzheimer's Risk Assessment</CardTitle>
              <CardDescription className="text-purple-100 text-sm">
                Advanced machine learning prediction using CatBoost model
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Show Results First if Available */}
          {predictionData && (
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                AI Prediction Results
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-6 rounded-xl shadow-xl text-white">
                  <p className="text-sm mb-2 opacity-90">Diagnosis</p>
                  <p className="text-3xl font-bold">{predictionData.prediction?.diagnosis}</p>
                </div>

                <div className={`p-6 rounded-xl shadow-xl border-4 ${
                  predictionData.prediction?.risk_level === 'Low Risk' ? 'bg-green-500 border-green-600' :
                  predictionData.prediction?.risk_level === 'Moderate Risk' ? 'bg-orange-500 border-orange-600' :
                  'bg-red-500 border-red-600'
                } text-white`}>
                  <p className="text-sm mb-2 opacity-90">Risk Level</p>
                  <p className="text-3xl font-bold">{predictionData.prediction?.risk_level}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-xl text-white">
                  <p className="text-sm mb-2 opacity-90">Probability</p>
                  <p className="text-4xl font-bold">{predictionData.prediction?.probability_percentage?.toFixed(1)}%</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-xl text-white">
                  <p className="text-sm mb-2 opacity-90">Classification</p>
                  <p className="text-2xl font-bold">
                    {predictionData.prediction?.result === 1 ? 'Positive' : 'Negative'}
                  </p>
                </div>
              </div>

              {/* Dataset Analysis Section */}
              {predictionData.dataset_analysis && (
                <div className="mt-6 space-y-4">
                  <h4 className="text-xl font-bold text-gray-800 flex items-center">
                    <PieChart className="h-6 w-6 text-purple-600 mr-2" />
                    Dataset-Based Analysis
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Age Comparison */}
                    {predictionData.dataset_analysis.age_comparison && (
                      <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg">
                        <h5 className="font-bold text-blue-800 mb-2">Age Analysis</h5>
                        <p className="text-sm text-gray-700">
                          Your age ({predictionData.dataset_analysis.age_comparison.user_age}) is in the{' '}
                          <span className="font-bold text-blue-600">
                            {predictionData.dataset_analysis.age_comparison.percentile?.toFixed(1)}th percentile
                          </span>
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Dataset average: {predictionData.dataset_analysis.age_comparison.dataset_mean_age?.toFixed(1)} years
                        </p>
                      </div>
                    )}

                    {/* MMSE Comparison */}
                    {predictionData.dataset_analysis.mmse_comparison && (
                      <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg">
                        <h5 className="font-bold text-green-800 mb-2">MMSE Score Analysis</h5>
                        <p className="text-sm text-gray-700">
                          Your MMSE score ({predictionData.dataset_analysis.mmse_comparison.user_mmse}) is better than{' '}
                          <span className="font-bold text-green-600">
                            {predictionData.dataset_analysis.mmse_comparison.percentile?.toFixed(1)}%
                          </span>{' '}
                          of patients
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Dataset average: {predictionData.dataset_analysis.mmse_comparison.dataset_mean_mmse?.toFixed(1)}
                        </p>
                      </div>
                    )}

                    {/* Similar Patients */}
                    {predictionData.dataset_analysis.similar_patients && (
                      <div className="bg-purple-50 border-2 border-purple-200 p-4 rounded-lg md:col-span-2">
                        <h5 className="font-bold text-purple-800 mb-2">Similar Patients in Dataset</h5>
                        <p className="text-sm text-gray-700 mb-2">
                          Found {predictionData.dataset_analysis.similar_patients.count} similar patients based on your profile
                        </p>
                        {predictionData.dataset_analysis.similar_patients.diagnosis_distribution && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {Object.entries(predictionData.dataset_analysis.similar_patients.diagnosis_distribution).map(([diagnosis, count]) => (
                              <span key={diagnosis} className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                                {diagnosis}: {count}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Dataset Overview */}
                    {predictionData.dataset_analysis.total_patients_in_dataset && (
                      <div className="bg-gray-50 border-2 border-gray-200 p-4 rounded-lg md:col-span-2">
                        <h5 className="font-bold text-gray-800 mb-2">Dataset Overview</h5>
                        <p className="text-sm text-gray-700">
                          Analysis based on <span className="font-bold text-purple-600">{predictionData.dataset_analysis.total_patients_in_dataset}</span> patients in our comprehensive Alzheimer's disease database
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recommendations Section */}
              {predictionData.recommendations && predictionData.recommendations.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <AlertCircle className="h-6 w-6 text-purple-600 mr-2" />
                    Personalized Recommendations
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {predictionData.recommendations.map((rec, index) => (
                      <div key={index} className="bg-white border-2 border-gray-300 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${
                            rec.category === 'Urgent' ? 'bg-red-100' :
                            rec.category === 'Important' ? 'bg-orange-100' :
                            rec.category === 'Preventive' ? 'bg-green-100' :
                            'bg-blue-100'
                          }`}>
                            <AlertCircle className={`h-5 w-5 ${
                              rec.category === 'Urgent' ? 'text-red-600' :
                              rec.category === 'Important' ? 'text-orange-600' :
                              rec.category === 'Preventive' ? 'text-green-600' :
                              'text-blue-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="font-bold text-gray-800">{rec.title}</h5>
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                rec.category === 'Urgent' ? 'bg-red-100 text-red-700' :
                                rec.category === 'Important' ? 'bg-orange-100 text-orange-700' :
                                rec.category === 'Preventive' ? 'bg-green-100 text-green-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {rec.category}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{rec.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
                <h4 className="text-lg font-bold text-gray-800 mb-3">Probability Visualization</h4>
                <div className="w-full bg-gray-200 rounded-full h-8 mb-2">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-8 rounded-full transition-all duration-500 flex items-center justify-center text-white font-bold text-sm"
                    style={{ width: `${predictionData.prediction?.probability_percentage}%` }}
                  >
                    {predictionData.prediction?.probability_percentage?.toFixed(1)}%
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-2">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                <p className="text-sm text-yellow-900">
                  <strong>⚕️ Medical Disclaimer:</strong> This AI prediction is a supplementary diagnostic tool. Always consult qualified healthcare professionals for proper diagnosis, treatment, and medical advice.
                </p>
              </div>
            </div>
          )}

          {/* Input Form - Collapsible or Secondary */}
          <div className={predictionData ? 'border-t-2 border-gray-200 pt-6' : ''}>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2 text-sm">
                {predictionData ? '↻' : '1'}
              </span>
              {predictionData ? 'Run New Prediction' : 'Enter Patient Data'}
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
              <form onSubmit={handlePredictionSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-sm font-semibold text-gray-700">Age (years)</Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      value={formData.age}
                      onChange={handleInputChange}
                      onWheel={(e) => e.target.blur()}
                      placeholder="e.g., 75"
                      required
                      autoComplete="off"
                      className="border-2 border-purple-200 focus:border-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-semibold text-gray-700">Gender</Label>
                    <Input
                      id="gender"
                      name="gender"
                      type="number"
                      value={formData.gender}
                      onChange={handleInputChange}
                      onWheel={(e) => e.target.blur()}
                      placeholder="0=F, 1=M"
                      required
                      autoComplete="off"
                      className="border-2 border-purple-200 focus:border-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="education" className="text-sm font-semibold text-gray-700">Education (yrs)</Label>
                    <Input
                      id="education"
                      name="education"
                      type="number"
                      value={formData.education}
                      onChange={handleInputChange}
                      onWheel={(e) => e.target.blur()}
                      placeholder="e.g., 16"
                      required
                      autoComplete="off"
                      className="border-2 border-purple-200 focus:border-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apoe4" className="text-sm font-semibold text-gray-700">APOE4</Label>
                    <Input
                      id="apoe4"
                      name="apoe4"
                      type="number"
                      value={formData.apoe4}
                      onChange={handleInputChange}
                      onWheel={(e) => e.target.blur()}
                      placeholder="0 or 1"
                      required
                      autoComplete="off"
                      className="border-2 border-purple-200 focus:border-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mmse" className="text-sm font-semibold text-gray-700">MMSE (0-30)</Label>
                    <Input
                      id="mmse"
                      name="mmse"
                      type="number"
                      value={formData.mmse}
                      onChange={handleInputChange}
                      onWheel={(e) => e.target.blur()}
                      placeholder="e.g., 24"
                      required
                      autoComplete="off"
                      className="border-2 border-purple-200 focus:border-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cdr" className="text-sm font-semibold text-gray-700">CDR (0-3)</Label>
                    <Input
                      id="cdr"
                      name="cdr"
                      type="number"
                      step="0.5"
                      value={formData.cdr}
                      onChange={handleInputChange}
                      onWheel={(e) => e.target.blur()}
                      placeholder="e.g., 0.5"
                      required
                      autoComplete="off"
                      className="border-2 border-purple-200 focus:border-purple-500"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={predictionLoading}
                  className="w-full bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:from-purple-700 hover:via-purple-600 hover:to-pink-600 text-white py-6 text-lg font-bold shadow-lg"
                >
                  {predictionLoading ? (
                    <>
                      <Loader className="h-6 w-6 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-6 w-6 mr-2" />
                      Predict Alzheimer's Risk
                    </>
                  )}
                </Button>
              </form>
              </div>

              {/* Status Display */}
              <div>
                {predictionError && (
                  <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-800">Error</h4>
                      <p className="text-sm text-red-600 mt-1">{predictionError}</p>
                    </div>
                  </div>
                )}

                {!predictionData && !predictionError && !predictionLoading && (
                  <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300 p-8">
                    <div className="text-center">
                      <Brain className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">Ready for AI Analysis</p>
                      <p className="text-gray-500 text-sm mt-2">Fill in the patient data and click predict</p>
                    </div>
                  </div>
                )}

                {predictionLoading && (
                  <div className="h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-300 p-8">
                    <div className="text-center">
                      <Loader className="h-20 w-20 text-purple-500 mx-auto mb-4 animate-spin" />
                      <p className="text-purple-700 font-bold text-lg">Analyzing Patient Data...</p>
                      <p className="text-purple-600 text-sm mt-2">AI model is processing</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient Overview Cards - Secondary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border border-gray-300 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3 bg-pink-50 rounded-t-lg">
            <CardTitle className="text-sm font-semibold text-pink-600">Memory Score</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-4xl font-bold text-pink-500">{patientAssessments[patientAssessments.length - 1]?.memoryScore || 0}/100</div>
            <p className="text-xs text-gray-500 mt-2">Latest assessment</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-300 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3 bg-purple-50 rounded-t-lg">
            <CardTitle className="text-sm font-semibold text-purple-700">Active Medications</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-4xl font-bold text-purple-600">{patientMedications.length}</div>
            <p className="text-xs text-gray-500 mt-2">Current prescriptions</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-300 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3 bg-pink-50 rounded-t-lg">
            <CardTitle className="text-sm font-semibold text-pink-600">Activities Today</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-4xl font-bold text-pink-500">{patientActivities.filter(a => a.date === new Date().toISOString().split('T')[0]).length}</div>
            <p className="text-xs text-gray-500 mt-2">Completed activities</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-600 border border-gray-300 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white">Next Appointment</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-4xl font-bold text-white">{patientAppointments[0]?.date ? new Date(patientAppointments[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'None'}</div>
            <p className="text-xs text-purple-100 mt-2">{patientAppointments[0]?.doctor || 'No upcoming'}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border border-gray-300 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-50 via-white to-gray-50 border-b border-gray-300 pb-3">
            <CardTitle className="text-gray-800 text-base font-semibold">Patient Profile</CardTitle>
            <CardDescription className="text-gray-500 text-xs">Current patient information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-start space-x-4 bg-purple-50 p-4 rounded-xl">
              <div className="bg-purple-600 p-3 rounded-full shadow-md">
                <User className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl text-gray-800">{selectedPatient?.name}</h3>
                <p className="text-sm text-gray-600 mt-1">Age: {selectedPatient?.age} years</p>
                <p className="text-sm text-gray-600">Diagnosis: {selectedPatient?.diagnosis}</p>
                <p className="text-sm text-purple-600 font-medium">Stage: {selectedPatient?.stage}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-semibold text-sm text-gray-700 mb-3">Emergency Contact</h4>
              <div className="flex items-center space-x-2 text-sm bg-gray-50 p-3 rounded-lg">
                <Phone className="h-4 w-4 text-purple-600" />
                <span className="text-gray-600">Caregiver ID: {selectedPatient?.caregiverId}</span>
              </div>
              <Button className="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white border-none shadow-md">
                <Phone className="h-4 w-4 mr-2" />
                Contact Caregiver
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-300 shadow-xl">
          <CardHeader className="border-b border-gray-300 pb-3">
            <CardTitle className="text-gray-800 text-base font-semibold">Cognitive Progress</CardTitle>
            <CardDescription className="text-gray-500 text-xs">Assessment scores over time</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="85%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Line type="monotone" dataKey="Memory" stroke="#ec4899" strokeWidth={3} dot={{ fill: '#ec4899', strokeWidth: 2, r: 4 }} />
                  <Line type="monotone" dataKey="Cognitive" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }} />
                  <Line type="monotone" dataKey="Behavior" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>

              <div className="flex justify-center items-center space-x-8 mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-pink-500 shadow-sm"></div>
                  <span className="text-sm text-gray-700 font-medium">Memory</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500 shadow-sm"></div>
                  <span className="text-sm text-gray-700 font-medium">Cognitive</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-green-500 shadow-sm"></div>
                  <span className="text-sm text-gray-700 font-medium">Behavior</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border border-gray-300 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 border-b border-gray-300 pb-3">
          <CardTitle className="text-gray-800 text-base font-semibold">Recent Activities</CardTitle>
          <CardDescription className="text-gray-500 text-xs">Latest daily activities and mood tracking</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {patientActivities.slice(0, 3).map((activity, index) => (
              <div key={activity.id} className={`flex items-start space-x-4 p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow ${
                index === 0 ? 'bg-pink-50 border border-gray-300' :
                index === 1 ? 'bg-gray-50 border border-gray-300' :
                'bg-pink-50 border border-gray-300'
              }`}>
                <div className={`p-3 rounded-full shadow-sm ${
                  index === 0 ? 'bg-pink-500' :
                  index === 1 ? 'bg-gray-500' :
                  'bg-pink-400'
                }`}>
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-800">{activity.type}</h4>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    </div>
                    <span className="text-xs font-medium text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">{activity.duration}</span>
                  </div>
                  <div className="flex items-center mt-3 space-x-3">
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{activity.date}</span>
                    <span className="text-xs px-3 py-1 bg-pink-500 text-white rounded-full shadow-sm font-medium">Mood: {activity.mood}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'} overflow-y-auto`}>
        {/* Header with Sidebar Toggle */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex flex-col space-y-1"
            >
              <div className="w-5 h-0.5 bg-gray-600 rounded"></div>
              <div className="w-4 h-0.5 bg-gray-600 rounded"></div>
              <div className="w-3 h-0.5 bg-gray-600 rounded"></div>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
            </div>
          </div>
        </div>

        <div className="p-8">
          <DashboardView />
        </div>
      </main>
    </div>
  );
}
