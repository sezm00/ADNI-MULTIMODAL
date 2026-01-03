import React, { useState } from 'react';
import axios from 'axios';

function AIDiagnosis() {
  const [formData, setFormData] = useState({
    // Dataset lookup (optional)
    RID: '',

    // Demographics
    AGE: '',
    PTGENDER: 'Male',
    PTEDUCAT: '',
    PTMARRY: 'Married',
    
    // Genetics
    APOE4: '0',
    
    // Cognitive Tests
    MMSE: '',
    ADAS11: '',
    ADAS13: '',
    CDRSB: '',
    MOCA: '',
    FAQ: '',
    
    // Memory Tests
    RAVLT_immediate: '',
    RAVLT_learning: '',
    RAVLT_forgetting: '',
    LDELTOTAL: '',
    
    // Brain Imaging
    Hippocampus: '',
    Ventricles: '',
    WholeBrain: '',
    Entorhinal: '',
    Fusiform: '',
    MidTemp: '',
    ICV: '',
    
    // Biomarkers (optional)
    ABETA_bl: '',
    TAU_bl: '',
    PTAU_bl: '',
    FDG_bl: '',
    
    // Visit Info
    Month: '0'
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Convert string values to numbers, keeping only filled fields
      const payload = {};
      
      Object.keys(formData).forEach(key => {
        const value = formData[key];
        if (value !== '') {
          // Keep categorical fields as strings
          if (['PTGENDER', 'PTMARRY'].includes(key)) {
            payload[key] = value;
          } else {
            // Convert to number
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
              payload[key] = numValue;
            }
          }
        }
      });

      // If RID is present, switch to dataset-backed prediction mode.
      if (formData.RID !== '') {
        const ridInt = parseInt(formData.RID, 10);
        if (!isNaN(ridInt)) {
          payload.RID = ridInt;
          payload.useDataset = true;
        }
      }

      const response = await axios.post('http://localhost:5000/api/predict', payload);
      
      if (response.data.success) {
        setResult({
          prediction: response.data.prediction,
          confidence: response.data.confidence,
          probabilities: response.data.probabilities,
          risk_assessment: response.data.risk_assessment,
          timestamp: response.data.timestamp,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Prediction failed. Please check your inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDiagnosisColor = (diagnosis) => {
    switch(diagnosis) {
      case 'AD': return 'from-red-400 to-red-600';
      case 'MCI': return 'from-orange-400 to-orange-600';
      case 'CN': return 'from-emerald-400 to-emerald-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getDiagnosisLabel = (diagnosis) => {
    switch(diagnosis) {
      case 'AD': return "Alzheimer's Disease";
      case 'MCI': return 'Mild Cognitive Impairment';
      case 'CN': return 'Cognitively Normal';
      default: return diagnosis;
    }
  };

  return (
    <div className="w-full">
      {/* Assessment History Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
        <div className="glass-card p-4">
          <div className="text-gray-400 text-xs mb-1">Total Assessments</div>
          <div className="text-white text-2xl font-bold">12</div>
          <div className="text-gray-400 text-xs mt-1">Last: 3 days ago</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-gray-400 text-xs mb-1">Latest Score</div>
          <div className="text-emerald-400 text-2xl font-bold">CN</div>
          <div className="text-gray-400 text-xs mt-1">Cognitively Normal</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-gray-400 text-xs mb-1">Confidence</div>
          <div className="text-blue-400 text-2xl font-bold">92%</div>
          <div className="text-gray-400 text-xs mt-1">High accuracy</div>
        </div>
        <div className="glass-card p-4">
          <div className="text-gray-400 text-xs mb-1">Trend</div>
          <div className="text-teal-400 text-2xl font-bold">Improving</div>
          <div className="text-gray-400 text-xs mt-1">+5% vs last</div>
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">AI-Powered Alzheimer's Diagnosis</h1>
            <p className="text-gray-400 text-xs">Advanced XGBoost model for cognitive assessment</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Input Form */}
          <div>
            {/* Tab Navigation */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                  onClick={() => setActiveTab('basic')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'basic'
                      ? 'bg-gradient-to-br from-teal-400 to-teal-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  Basic Info
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('cognitive')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'cognitive'
                      ? 'bg-gradient-to-br from-teal-400 to-teal-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  Cognitive Tests
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('imaging')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'imaging'
                      ? 'bg-gradient-to-br from-teal-400 to-teal-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  Brain Imaging
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Basic Info Tab */}
                {activeTab === 'basic' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">RID (optional)</label>
                        <input
                          type="number"
                          name="RID"
                          value={formData.RID}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 
                                   text-white placeholder-gray-300 text-sm focus:outline-none focus:border-teal-400 transition-all"
                          placeholder="e.g., 3"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Age (years) <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          name="AGE"
                          value={formData.AGE}
                          onChange={handleChange}
                          required={!formData.RID}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 
                                   text-white placeholder-gray-300 text-sm focus:outline-none focus:border-teal-400 transition-all"
                          placeholder="e.g., 75.5"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Gender</label>
                        <select
                          name="PTGENDER"
                          value={formData.PTGENDER}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 
                                   text-white text-sm focus:outline-none focus:border-teal-400 transition-all"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Education (years)</label>
                        <input
                          type="number"
                          name="PTEDUCAT"
                          value={formData.PTEDUCAT}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 
                                   text-white placeholder-gray-300 text-sm focus:outline-none focus:border-teal-400 transition-all"
                          placeholder="e.g., 16"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">APOE4 Alleles</label>
                        <select
                          name="APOE4"
                          value={formData.APOE4}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 
                                   text-white text-sm focus:outline-none focus:border-teal-400 transition-all"
                        >
                          <option value="0">0 (No risk)</option>
                          <option value="1">1 (Heterozygous)</option>
                          <option value="2">2 (Homozygous)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cognitive Tests Tab */}
                {activeTab === 'cognitive' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          MMSE (0-30) <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          name="MMSE"
                          value={formData.MMSE}
                          onChange={handleChange}
                          required={!formData.RID}
                          min="0"
                          max="30"
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 
                                   text-white placeholder-gray-300 text-sm focus:outline-none focus:border-teal-400 transition-all"
                          placeholder="e.g., 24"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">ADAS13</label>
                        <input
                          type="number"
                          step="0.1"
                          name="ADAS13"
                          value={formData.ADAS13}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 
                                   text-white placeholder-gray-300 text-sm focus:outline-none focus:border-teal-400 transition-all"
                          placeholder="e.g., 18.5"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">ADAS11</label>
                        <input
                          type="number"
                          step="0.1"
                          name="ADAS11"
                          value={formData.ADAS11}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 
                                   text-white placeholder-gray-300 text-sm focus:outline-none focus:border-teal-400 transition-all"
                          placeholder="Optional"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">CDR-SB</label>
                        <input
                          type="number"
                          step="0.1"
                          name="CDRSB"
                          value={formData.CDRSB}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 
                                   text-white placeholder-gray-300 text-sm focus:outline-none focus:border-teal-400 transition-all"
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">MOCA</label>
                        <input
                          type="number"
                          step="0.1"
                          name="MOCA"
                          value={formData.MOCA}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 
                                   text-white placeholder-gray-300 text-sm focus:outline-none focus:border-teal-400 transition-all"
                          placeholder="Optional"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">FAQ Score</label>
                        <input
                          type="number"
                          step="0.1"
                          name="FAQ"
                          value={formData.FAQ}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 
                                   text-white placeholder-gray-300 text-sm focus:outline-none focus:border-teal-400 transition-all"
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">RAVLT Immediate</label>
                        <input
                          type="number"
                          step="0.1"
                          name="RAVLT_immediate"
                          value={formData.RAVLT_immediate}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 
                                   text-white placeholder-gray-300 text-sm focus:outline-none focus:border-teal-400 transition-all"
                          placeholder="Optional"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">RAVLT Learning</label>
                        <input
                          type="number"
                          step="0.1"
                          name="RAVLT_learning"
                          value={formData.RAVLT_learning}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 
                                   text-white placeholder-gray-300 text-sm focus:outline-none focus:border-teal-400 transition-all"
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Brain Imaging Tab */}
                {activeTab === 'imaging' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Hippocampus Volume (mm³) <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        name="Hippocampus"
                        value={formData.Hippocampus}
                        onChange={handleChange}
                        required={!formData.RID}
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 
                                 text-white placeholder-gray-300 text-sm focus:outline-none focus:border-teal-400 transition-all"
                        placeholder="e.g., 3500.5"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Ventricles (mm³)</label>
                        <input
                          type="number"
                          step="0.1"
                          name="Ventricles"
                          value={formData.Ventricles}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 
                                   text-white placeholder-gray-300 text-sm focus:outline-none focus:border-teal-400 transition-all"
                          placeholder="Optional"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Whole Brain (mm³)</label>
                        <input
                          type="number"
                          step="0.1"
                          name="WholeBrain"
                          value={formData.WholeBrain}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 
                                   text-white placeholder-gray-300 text-sm focus:outline-none focus:border-teal-400 transition-all"
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Entorhinal (mm³)</label>
                        <input
                          type="number"
                          step="0.1"
                          name="Entorhinal"
                          value={formData.Entorhinal}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 
                                   text-white placeholder-gray-300 text-sm focus:outline-none focus:border-teal-400 transition-all"
                          placeholder="Optional"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Fusiform (mm³)</label>
                        <input
                          type="number"
                          step="0.1"
                          name="Fusiform"
                          value={formData.Fusiform}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 
                                   text-white placeholder-gray-300 text-sm focus:outline-none focus:border-teal-400 transition-all"
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">MidTemp (mm³)</label>
                        <input
                          type="number"
                          step="0.1"
                          name="MidTemp"
                          value={formData.MidTemp}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 
                                   text-white placeholder-gray-300 text-sm focus:outline-none focus:border-teal-400 transition-all"
                          placeholder="Optional"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">ICV (mm³)</label>
                        <input
                          type="number"
                          step="0.1"
                          name="ICV"
                          value={formData.ICV}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 
                                   text-white placeholder-gray-300 text-sm focus:outline-none focus:border-teal-400 transition-all"
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-br from-teal-400 to-teal-600 text-white font-medium rounded-xl
                           hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </span>
                  ) : (
                    'Get AI Diagnosis'
                  )}
                </button>
              </form>

              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <h3 className="text-blue-300 font-semibold text-sm mb-2">ℹ️ Quick Guide</h3>
                <ul className="text-gray-300 text-xs space-y-1">
                  <li>• Fill in <strong>Basic Info, Cognitive Tests, and Brain Imaging</strong> tabs</li>
                  <li>• Required fields marked with <span className="text-red-400">*</span></li>
                  <li>• More data = better prediction accuracy</li>
                  <li>• Optional fields can be left blank</li>
                </ul>
              </div>
            </div>

            {/* Results Display */}
            <div>
              {result ? (
                <div className="space-y-4">
                  <div className={`glass-card p-6 bg-gradient-to-br ${getDiagnosisColor(result.prediction)} text-white`}>
                    <div className="text-center">
                      <div className="text-sm font-medium opacity-90 mb-2">AI Prediction</div>
                      <div className="text-4xl font-bold mb-2">{getDiagnosisLabel(result.prediction)}</div>
                      <div className="text-lg opacity-90">
                        Confidence: {(result.confidence * 100).toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  <div className="glass-card p-6">
                    <h3 className="text-white font-semibold mb-4">Probability Breakdown</h3>
                    <div className="space-y-3">
                      {Object.entries(result.probabilities).map(([key, value]) => (
                        <div key={key}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-300">{getDiagnosisLabel(key)}</span>
                            <span className="text-white font-medium">{(value * 100).toFixed(2)}%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full bg-gradient-to-r ${getDiagnosisColor(key)}`}
                              style={{ width: `${value * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card p-6">
                    <h3 className="text-white font-semibold mb-3">Clinical Interpretation</h3>
                    <div className="text-gray-300 text-sm space-y-2">
                      {result.prediction === 'AD' && (
                        <>
                          <p className="text-red-300">The model indicates a high probability of Alzheimer's Disease.</p>
                          <p>Immediate consultation with a neurologist is recommended for comprehensive evaluation and treatment planning.</p>
                        </>
                      )}
                      {result.prediction === 'MCI' && (
                        <>
                          <p className="text-orange-300">Mild Cognitive Impairment detected.</p>
                          <p>Regular monitoring and cognitive interventions are advised. Follow-up assessments every 6 months recommended.</p>
                        </>
                      )}
                      {result.prediction === 'CN' && (
                        <>
                          <p className="text-emerald-300">Cognitive function appears normal.</p>
                          <p>Continue healthy lifestyle practices and regular health check-ups as preventive measures.</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-card p-12 flex items-center justify-center h-full">
                  <div className="text-center text-gray-400">
                    <svg className="w-24 h-24 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <p className="text-lg">Enter patient data to get AI diagnosis</p>
                    <p className="text-sm mt-2">Results will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
      </div>

      {/* Assessment History */}
      <div className="glass-card p-5 mt-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Assessment History</h3>
          <button className="text-teal-400 text-sm hover:text-teal-300">View All</button>
        </div>
        <div className="space-y-3">
          {[
            { date: '3 days ago', result: 'CN', confidence: 92, mmse: 28, adas: 10 },
            { date: '1 week ago', result: 'CN', confidence: 90, mmse: 27, adas: 11 },
            { date: '2 weeks ago', result: 'CN', confidence: 89, mmse: 28, adas: 10 },
            { date: '1 month ago', result: 'MCI', confidence: 78, mmse: 25, adas: 15 },
          ].map((assessment, idx) => (
            <div key={idx} className="glass-card p-4 hover:bg-white/15 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getDiagnosisColor(assessment.result)} flex items-center justify-center`}>
                    <span className="text-white font-bold text-sm">{assessment.result}</span>
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">{getDiagnosisLabel(assessment.result)}</div>
                    <div className="text-gray-400 text-xs">{assessment.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-gray-400 text-xs">Confidence</div>
                    <div className="text-teal-400 text-sm font-semibold">{assessment.confidence}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-400 text-xs">MMSE</div>
                    <div className="text-white text-sm font-semibold">{assessment.mmse}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-400 text-xs">ADAS</div>
                    <div className="text-white text-sm font-semibold">{assessment.adas}</div>
                  </div>
                  <button className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs transition-all">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AIDiagnosis;
