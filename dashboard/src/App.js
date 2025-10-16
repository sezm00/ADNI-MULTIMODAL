import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '/components/ui/card';
import { Button } from '/components/ui/button';
import { Input } from '/components/ui/input';
import { Label } from '/components/ui/label';
import { Textarea } from '/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Clock, Activity, Pill, Brain, User, Phone, AlertCircle, Home, Menu } from 'lucide-react';

export default function AlzheimerCareApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('1');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const Navigation = () => (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="bg-gray-900 p-2 rounded-lg shadow-md">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900">AlzCare Plus</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-2">
            <Button 
              variant={activeTab === 'dashboard' ? 'default' : 'ghost'} 
              onClick={() => setActiveTab('dashboard')}
              className={activeTab === 'dashboard' ? 'bg-pink-500 hover:bg-pink-600 text-white shadow-md' : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'}
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </div>

          <div className="md:hidden flex items-center">
            <Button variant="ghost" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );

  const DashboardView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border-none shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3 bg-pink-50 rounded-t-lg">
            <CardTitle className="text-sm font-semibold text-pink-700">Memory Score</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-4xl font-bold text-pink-500">{patientAssessments[patientAssessments.length - 1]?.memoryScore || 0}/100</div>
            <p className="text-xs text-gray-500 mt-2">Latest assessment</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-50 border-none shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Active Medications</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-4xl font-bold text-gray-800">{patientMedications.length}</div>
            <p className="text-xs text-gray-500 mt-2">Current prescriptions</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-2 border-pink-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-pink-600">Activities Today</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-4xl font-bold text-pink-500">{patientActivities.filter(a => a.date === new Date().toISOString().split('T')[0]).length}</div>
            <p className="text-xs text-gray-500 mt-2">Completed activities</p>
          </CardContent>
        </Card>

        <Card className="bg-pink-500 border-none shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white">Next Appointment</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-4xl font-bold text-white">{patientAppointments[0]?.date ? new Date(patientAppointments[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'None'}</div>
            <p className="text-xs text-pink-100 mt-2">{patientAppointments[0]?.doctor || 'No upcoming'}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border-none shadow-xl">
          <CardHeader className="bg-gradient-to-r from-pink-50 via-white to-gray-50 border-b border-gray-100 pb-3">
            <CardTitle className="text-gray-800 text-base font-semibold">Patient Profile</CardTitle>
            <CardDescription className="text-gray-500 text-xs">Current patient information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-start space-x-4 bg-pink-50 p-4 rounded-xl">
              <div className="bg-pink-500 p-3 rounded-full shadow-md">
                <User className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl text-gray-800">{selectedPatient?.name}</h3>
                <p className="text-sm text-gray-600 mt-1">Age: {selectedPatient?.age} years</p>
                <p className="text-sm text-gray-600">Diagnosis: {selectedPatient?.diagnosis}</p>
                <p className="text-sm text-pink-600 font-medium">Stage: {selectedPatient?.stage}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-semibold text-sm text-gray-700 mb-3">Emergency Contact</h4>
              <div className="flex items-center space-x-2 text-sm bg-gray-50 p-3 rounded-lg">
                <Phone className="h-4 w-4 text-pink-500" />
                <span className="text-gray-600">Caregiver ID: {selectedPatient?.caregiverId}</span>
              </div>
              <Button className="mt-3 w-full bg-pink-500 hover:bg-pink-600 text-white border-none shadow-md">
                <Phone className="h-4 w-4 mr-2" />
                Contact Caregiver
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-none shadow-xl">
          <CardHeader className="border-b border-gray-200 pb-3">
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
                  <Line type="monotone" dataKey="Cognitive" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }} />
                  <Line type="monotone" dataKey="Behavior" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
              
              {/* Custom Legend - Separated and properly styled */}
              <div className="flex justify-center items-center space-x-8 mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-pink-500 shadow-sm"></div>
                  <span className="text-sm text-gray-700 font-medium">Memory</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-purple-500 shadow-sm"></div>
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

      <Card className="bg-white border-none shadow-xl">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-pink-50 border-b border-gray-100 pb-3">
          <CardTitle className="text-gray-800 text-base font-semibold">Recent Activities</CardTitle>
          <CardDescription className="text-gray-500 text-xs">Latest daily activities and mood tracking</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {patientActivities.slice(0, 3).map((activity, index) => (
              <div key={activity.id} className={`flex items-start space-x-4 p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow ${
                index === 0 ? 'bg-pink-50 border border-pink-100' : 
                index === 1 ? 'bg-gray-50 border border-gray-200' : 
                'bg-pink-50 border border-pink-100'
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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="flex-shrink-0">
              <div className="bg-pink-500 p-2 rounded-lg shadow-md">
                <Home className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-500 text-xs mt-1">Overview of patient health and activities</p>
            </div>
          </div>
        </div>

        <DashboardView />
      </main>
    </div>
  );
}



