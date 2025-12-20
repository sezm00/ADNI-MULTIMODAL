import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentsAPI, doctorsAPI } from '../services/api';

function DoctorManagement() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(15);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [activeView, setActiveView] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      console.log('No token or user, redirecting to login');
      navigate('/');
      return;
    }

    const user = JSON.parse(userStr);
    if (user.role !== 'doctor') {
      console.log('Not a doctor, redirecting');
      navigate('/');
      return;
    }
    
    fetchAppointments();
    fetchStatistics(user.id);
  }, [navigate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await appointmentsAPI.getAll();
      if (response.data.success) {
        // Format appointments for display
        const formattedAppointments = response.data.appointments.map(apt => ({
          id: apt._id,
          time: new Date(apt.date + ' ' + apt.time).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          patientName: apt.patientId?.name || 'Unknown Patient',
          condition: apt.condition,
          status: apt.status,
          avatar: apt.patientId?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
          patientDetails: {
            age: apt.patientId?.age ? `${apt.patientId.age} Years, ${apt.patientId.gender}` : 'N/A',
            mrn: `MRN-${apt.patientId?._id?.slice(-8) || '00000000'}`,
            time: apt.time,
            specialNote: apt.consultationNotes || apt.notes || 'No notes available',
            fee: `${apt.fee || 0}$`,
            paymentStatus: apt.paymentStatus || 'Pending',
            cardInfo: apt.cardInfo || 'N/A'
          }
        }));
        setAppointments(formattedAppointments);
      }
    } catch (err) {
      console.error('Fetch appointments error:', err);
      setError('Failed to load appointments. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async (userId) => {
    try {
      if (userId) {
        const response = await doctorsAPI.getStatistics(userId);
        if (response.data.success) {
          setStatistics(response.data.statistics);
        }
      }
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  };

  const handleUpdateAppointment = async (appointmentId, updates) => {
    try {
      const response = await appointmentsAPI.update(appointmentId, updates);
      if (response.data.success) {
        await fetchAppointments();
      }
    } catch (err) {
      setError('Failed to update appointment');
      console.error(err);
    }
  };

  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const dates = [
    [null, null, null, null, 1, 2, 3],
    [4, 5, 6, 7, 8, 9, 10],
    [11, 12, 13, 14, 15, 16, 17],
    [18, 19, 20, 21, 22, 23, 24],
    [25, 26, 27, 28, 29, 30, null]
  ];

  const currentPatient = selectedAppointment ? {
    name: selectedAppointment.patientName,
    age: selectedAppointment.patientDetails?.age || 'N/A',
    time: selectedAppointment.patientDetails?.time || 'N/A',
    mrn: selectedAppointment.patientDetails?.mrn || 'N/A',
    type: 'Consultation',
    condition: selectedAppointment.condition,
    specialNote: selectedAppointment.patientDetails?.specialNote || 'No notes available',
    fee: selectedAppointment.patientDetails?.fee || '0$',
    paymentStatus: selectedAppointment.patientDetails?.paymentStatus || 'Pending',
    cardInfo: selectedAppointment.patientDetails?.cardInfo || 'N/A'
  } : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-800 via-gray-700 to-red-800 p-6">
      <div className="max-w-[1600px] mx-auto glass-card overflow-hidden h-[calc(100vh-3rem)]">
        
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-white font-semibold text-base">ALZ ForeSight</span>
              <span className="text-gray-400 text-sm">For Doctors</span>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search patients, appointments..."
                className="w-full pl-12 pr-4 py-2.5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 
                         text-white placeholder-gray-400 text-sm focus:outline-none focus:border-white/40 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all relative">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-10 h-10 rounded-full border-2 border-white/30 bg-white/10"></div>
          </div>
        </div>

        <div className="flex h-[calc(100%-80px)]">
          <div className="w-20 flex flex-col items-center py-6 gap-4 border-r border-white/10 overflow-visible">
            <button 
              onClick={() => setActiveView('appointments')} 
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all group relative overflow-visible ${
                activeView === 'appointments' ? 'bg-gradient-to-br from-red-400 to-red-600' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <svg className="w-6 h-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </button>
            
            <button 
              onClick={() => setActiveView('patients')} 
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all group relative overflow-visible ${
                activeView === 'patients' ? 'bg-gradient-to-br from-red-400 to-red-600' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <svg className="w-6 h-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </button>
            
            <button 
              onClick={() => setActiveView('calendar')} 
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all group relative overflow-visible ${
                activeView === 'calendar' ? 'bg-gradient-to-br from-red-400 to-red-600' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <svg className="w-6 h-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            
            <button 
              onClick={() => setActiveView('reports')} 
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all group relative overflow-visible ${
                activeView === 'reports' ? 'bg-gradient-to-br from-red-400 to-red-600' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <svg className="w-6 h-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            
            <button 
              onClick={() => setActiveView('messages')} 
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all group relative overflow-visible ${
                activeView === 'messages' ? 'bg-gradient-to-br from-red-400 to-red-600' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <svg className="w-6 h-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </button>
            
            <button className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all mt-auto group relative overflow-visible">
              <svg className="w-6 h-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </button>
            
            <button 
              onClick={handleLogout} 
              className="w-12 h-12 rounded-xl bg-white/10 hover:bg-red-500/20 flex items-center justify-center text-white transition-all group relative overflow-visible"
            >
              <svg className="w-6 h-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>

          <div className="flex-1 p-8 overflow-y-auto">
            
            {/* Appointments View */}
            {activeView === 'appointments' && (
              <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-1">Overview</h2>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="glass-card p-3 hover:bg-white/15 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-white font-medium text-sm">Appointments</h3>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white">{statistics?.totalAppointments || 0}</div>
                    <div className="text-xs text-emerald-400 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      12%
                    </div>
                  </div>
                  <svg className="w-16 h-10" viewBox="0 0 80 48">
                    <path d="M0 40 Q10 35, 20 30 T40 28 T60 25 T80 20" fill="none" stroke="#10b981" strokeWidth="2"/>
                  </svg>
                </div>
              </div>

              <div className="glass-card p-3 hover:bg-white/15 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <h3 className="text-white font-medium text-sm">New Patients</h3>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white">{statistics?.totalPatients || 0}</div>
                    <div className="text-xs text-red-400 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      2%
                    </div>
                  </div>
                  <svg className="w-16 h-10" viewBox="0 0 80 48">
                    <path d="M0 20 Q10 22, 20 28 T40 35 T60 40 T80 38" fill="none" stroke="#ef4444" strokeWidth="2"/>
                  </svg>
                </div>
              </div>

              <div className="glass-card p-3 hover:bg-white/15 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-white font-medium text-sm">Follow-Up</h3>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-bold text-white">{statistics?.completedAppointments || 0}</div>
                    <div className="text-xs text-emerald-400 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      8%
                    </div>
                  </div>
                  <svg className="w-16 h-10" viewBox="0 0 80 48">
                    <path d="M0 35 Q10 30, 20 28 T40 25 T60 22 T80 18" fill="none" stroke="#10b981" strokeWidth="2"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_1.2fr] gap-4">
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold text-base">Appointments</h3>
                    <p className="text-gray-400 text-xs">{loading ? 'Loading...' : appointments.length}</p>
                  </div>
                  <button className="text-blue-400 text-xs hover:text-blue-300">Show more</button>
                </div>

                {loading ? (
                  <div className="text-center text-gray-400 py-8">Loading appointments...</div>
                ) : error ? (
                  <div className="text-center text-red-400 py-8">{error}</div>
                ) : (
                <div className="space-y-2">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      onClick={() => setSelectedAppointment(appointment)}
                      className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${
                        selectedAppointment?.id === appointment.id 
                          ? 'bg-gradient-to-r from-red-500/20 to-red-600/10 border border-red-500/30' 
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="relative">
                        <div className="text-gray-400 text-xs font-medium w-14">{appointment.time}</div>
                        {appointment.status === 'current' && (
                          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-6 bg-red-500 rounded-r"></div>
                        )}
                      </div>
                      
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        appointment.status === 'completed' ? 'bg-emerald-500' :
                        appointment.status === 'current' ? 'bg-red-500' :
                        'bg-orange-500'
                      }`}></div>

                      <img
                        src={appointment.avatar}
                        alt={appointment.patientName}
                        className="w-8 h-8 rounded-full object-cover"
                      />

                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">{appointment.patientName}</div>
                        <div className="text-gray-400 text-xs">{appointment.condition}</div>
                      </div>

                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        appointment.status === 'completed' ? 'bg-emerald-500/20' :
                        appointment.status === 'current' ? 'bg-red-500/20' :
                        'bg-orange-500/20'
                      }`}>
                        <svg className={`w-4 h-4 ${
                          appointment.status === 'completed' ? 'text-emerald-500' :
                          appointment.status === 'current' ? 'text-red-500' :
                          'text-orange-500'
                        }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          {appointment.status === 'completed' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          )}
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </div>

              <div className="glass-card p-4">
                <h3 className="text-white font-semibold text-base mb-3">On going Appointments</h3>
                
                {selectedAppointment && currentPatient ? (
                  <div className="grid grid-cols-[1fr_1.2fr] gap-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-gray-400 text-xs mb-2">Patient Info</h4>
                        <div className="flex items-center gap-2 mb-3">
                          <img
                            src={selectedAppointment.avatar}
                            alt={currentPatient.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <div className="text-white font-medium">{currentPatient.name}</div>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Age</span>
                            <span className="text-white">{currentPatient.age}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Time</span>
                            <span className="text-white">{currentPatient.time}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">MRN</span>
                            <span className="text-white">{currentPatient.mrn}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Type</span>
                            <span className="text-white">{currentPatient.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">MRN</span>
                            <span className="text-white">{currentPatient.condition}</span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="text-gray-400 text-sm mb-2">Special Note</div>
                          <p className="text-white text-xs leading-relaxed">{currentPatient.specialNote}</p>
                        </div>

                        <div className="mt-4 p-3 rounded-xl bg-white/5">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-400 text-sm">Consultation Fee - {currentPatient.fee}</span>
                            <span className="px-2 py-1 rounded text-xs bg-emerald-500/20 text-emerald-400">{currentPatient.paymentStatus}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-6 rounded bg-gradient-to-r from-red-500 to-orange-500"></div>
                            <span className="text-white text-xs">{currentPatient.cardInfo}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-gray-400 text-xs mb-2">Consultation Notes</h4>
                      <div className="bg-white/5 rounded-xl p-3 h-64">
                        <p className="text-white text-sm leading-relaxed mb-4">
                          Lorem ipsum dolor sit amet consectetur. Vitae vitae pauere nunc senectus est. Fermentum 
                          suspendisse vitae enim diam pharetra. Congue ut sapien cursus massa odio placerat dignissim 
                          purus nunc. Tortor varius dictum pulvinar nec nec viverra eros.
                        </p>
                        <ul className="space-y-2 text-sm">
                          <li className="text-white flex items-start gap-2">
                            <span className="text-gray-400">•</span>
                            <span>Lorem ipsum dolor sit amet consectetur. Diam vitae vitae pauere senectus nec.</span>
                          </li>
                          <li className="text-white flex items-start gap-2">
                            <span className="text-gray-400">•</span>
                            <span>Fermentum suspendisse vitae enim diam pharetra.</span>
                          </li>
                          <li className="text-white flex items-start gap-2">
                            <span className="text-gray-400">•</span>
                            <span>Congue ut sapien cursus massa odio placerat dignissim purus nunc.</span>
                          </li>
                        </ul>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <button className="flex-1 py-2.5 px-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all flex flex-col items-center justify-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs">Reschedule</span>
                        </button>
                        <button className="flex-1 py-2.5 px-3 rounded-lg bg-gradient-to-br from-red-400 to-red-600 text-white text-sm font-medium hover:opacity-90 transition-all">
                          Finish consultation
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-400">
                    <div className="text-center">
                      <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-sm">Select an appointment to view details</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
              </>
            )}

            {/* Patients View */}
            {activeView === 'patients' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-1">Patient Management</h2>
                  <p className="text-gray-400 text-sm">Manage and view all patients</p>
                </div>
                {loading ? (
                  <div className="text-center text-gray-400 py-8">Loading patients...</div>
                ) : (
                <div className="grid grid-cols-1 gap-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="glass-card p-4 hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-4">
                        <img src={appointment.avatar} alt={appointment.patientName} className="w-16 h-16 rounded-full object-cover" />
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-lg">{appointment.patientName}</h3>
                          <p className="text-gray-400 text-sm">MRN: {appointment.patientDetails?.mrn || 'N/A'}</p>
                          <p className="text-gray-400 text-sm">{appointment.patientDetails?.age || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">{appointment.condition}</p>
                          <p className="text-sm text-emerald-400">{appointment.patientDetails?.paymentStatus || 'N/A'}</p>
                        </div>
                        <button className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </div>
            )}

            {/* Calendar View */}
            {activeView === 'calendar' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-1">Calendar & Schedule</h2>
                  <p className="text-gray-400 text-sm">View and manage appointments</p>
                </div>
                <div className="glass-card p-6">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">December 2025</h3>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all">
                          Today
                        </button>
                        <button className="w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all flex items-center justify-center">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button className="w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all flex items-center justify-center">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-2 mb-2">
                      {days.map((day) => (
                        <div key={day} className="text-center text-gray-400 text-xs font-medium py-2">{day}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {dates.flat().map((date, idx) => (
                        <div
                          key={idx}
                          onClick={() => date && setSelectedDate(date)}
                          className={`aspect-square flex items-center justify-center rounded-lg text-sm transition-all cursor-pointer
                            ${!date ? 'invisible' : ''}
                            ${date === selectedDate 
                              ? 'bg-gradient-to-br from-red-400 to-red-600 text-white font-bold' 
                              : 'bg-white/5 hover:bg-white/10 text-white'
                            }`}
                        >
                          {date}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-white/10 pt-6">
                    <h4 className="text-white font-semibold mb-4">Today's Appointments</h4>
                    <div className="space-y-2">
                      {appointments.slice(0, 5).map((apt) => (
                        <div key={apt.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                          <div className="text-sm text-gray-400">{apt.time}</div>
                          <div className="w-1 h-1 rounded-full bg-red-400"></div>
                          <div className="flex-1">
                            <p className="text-white text-sm font-medium">{apt.patientName}</p>
                            <p className="text-gray-400 text-xs">{apt.condition}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reports View */}
            {activeView === 'reports' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-1">Medical Reports</h2>
                  <p className="text-gray-400 text-sm">View and manage patient medical reports</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card p-4 hover:bg-white/10 transition-all cursor-pointer">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Lab Results</h3>
                        <p className="text-gray-400 text-xs">48 reports available</p>
                      </div>
                    </div>
                    <button className="w-full py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all text-sm">
                      View All
                    </button>
                  </div>
                  <div className="glass-card p-4 hover:bg-white/10 transition-all cursor-pointer">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Imaging Studies</h3>
                        <p className="text-gray-400 text-xs">23 scans available</p>
                      </div>
                    </div>
                    <button className="w-full py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all text-sm">
                      View All
                    </button>
                  </div>
                  <div className="glass-card p-4 hover:bg-white/10 transition-all cursor-pointer">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Prescriptions</h3>
                        <p className="text-gray-400 text-xs">156 prescriptions</p>
                      </div>
                    </div>
                    <button className="w-full py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all text-sm">
                      View All
                    </button>
                  </div>
                  <div className="glass-card p-4 hover:bg-white/10 transition-all cursor-pointer">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Visit History</h3>
                        <p className="text-gray-400 text-xs">98 patient visits</p>
                      </div>
                    </div>
                    <button className="w-full py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all text-sm">
                      View All
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Messages View */}
            {activeView === 'messages' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-1">Messages</h2>
                  <p className="text-gray-400 text-sm">Communicate with patients and staff</p>
                </div>
                <div className="grid grid-cols-3 gap-4 h-[calc(100vh-250px)]">
                  <div className="glass-card p-4 overflow-y-auto">
                    <div className="mb-4">
                      <input 
                        type="text" 
                        placeholder="Search messages..." 
                        className="w-full px-3 py-2 bg-white/10 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:bg-white/15"
                      />
                    </div>
                    <div className="space-y-2">
                      {appointments.map((apt) => (
                        <div key={apt.id} className="p-3 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-all">
                          <div className="flex items-center gap-3 mb-2">
                            <img src={apt.avatar} alt={apt.patientName} className="w-10 h-10 rounded-full object-cover" />
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">{apt.patientName}</p>
                              <p className="text-gray-400 text-xs truncate">Last message preview...</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2 glass-card p-4 flex flex-col">
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <p className="text-sm">Select a conversation to start messaging</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorManagement;
