import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BrainCanvas from './components/BrainCanvas';

function App() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(15);
  const [activeTab, setActiveTab] = useState('dashboard');

  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const dates = [
    [null, null, null, null, 1, 2, 3],
    [4, 5, 6, 7, 8, 9, 10],
    [11, 12, 13, 14, 15, 16, 17],
    [18, 19, 20, 21, 22, 23, 24],
    [25, 26, 27, 28, 29, 30, null]
  ];

  const appointments = [
    {
      id: 1,
      date: '26 April 23',
      title: 'Complete Blood Count (CBC)',
      doctor: 'Dr. Alberto',
      specialty: 'Therapist',
      doctorImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop',
      color: 'from-emerald-400 to-teal-500',
      badge: 'C'
    },
    {
      id: 2,
      date: '1 May 23',
      title: 'Clinic Visit Appointment',
      doctor: 'Dr. Lucia',
      specialty: 'Rdc',
      doctorImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop',
      color: 'from-purple-400 to-pink-500',
      badge: 'V'
    },
    {
      id: 3,
      date: '02 June 23',
      title: 'Video Consultation Chat',
      doctor: 'Dr. Mark',
      specialty: 'Aryan',
      doctorImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&h=100&fit=crop',
      color: 'from-cyan-400 to-blue-500',
      badge: 'V'
    }
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-800 via-gray-700 to-teal-800 p-6">
      <div className="max-w-[1600px] mx-auto glass-card overflow-hidden h-[calc(100vh-3rem)]">
        
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-white font-semibold text-base">ALZ ForeSight</span>
          </div>

          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search"
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
          <div className="w-20 flex flex-col items-center py-6 gap-4 border-r border-white/10">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all ${
                activeTab === 'dashboard' ? 'bg-gradient-to-br from-teal-400 to-teal-600' : 'bg-white/10 hover:bg-white/20'
              }`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </button>
            <button className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
            <button className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </button>
            <button className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </button>
            <button className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all mt-auto">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button onClick={() => navigate('/')} className="w-12 h-12 rounded-xl bg-white/10 hover:bg-red-600 flex items-center justify-center text-white transition-all">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>

          <div className="flex-1 p-8 overflow-y-auto">
            {activeTab === 'dashboard' && (
            <div className="grid grid-cols-[1.2fr_1fr] gap-8">
              
              <div className="relative">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">Overview</h2>
                      <p className="text-gray-300 text-sm">Patient Health</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="none" />
                          <circle cx="32" cy="32" r="28" stroke="url(#gradient1)" strokeWidth="6" fill="none" strokeDasharray="176" strokeDashoffset="35" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">5</span>
                        </div>
                        <svg width="0" height="0">
                          <defs>
                            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#10b981" />
                              <stop offset="100%" stopColor="#14b8a6" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold text-lg">6:41 PM</div>
                        <div className="text-gray-400 text-xs">Feb 2023 →</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full border-2 border-white/30 bg-white/10"></div>
                    <div>
                      <h3 className="text-white font-semibold">Jane Cardiologist</h3>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-white/10 hover:bg-white/20 transition-all mt-1 rounded-lg">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Video call
                      </button>
                    </div>
                  </div>
                </div>

                <div className="relative h-[400px]">
                  <BrainCanvas />
                  
                  <div className="absolute bottom-8 left-4">
                    <div className="glass-card px-4 py-3 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-white text-xs font-semibold">Brain Activity</div>
                        <div className="text-gray-300 text-xs">95% Active</div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-8 right-4">
                    <div className="glass-card px-4 py-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/20">
                          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jane2" alt="Jane" className="w-full h-full" />
                        </div>
                      </div>
                      <div className="text-white text-xs font-semibold">Monday</div>
                      <div className="text-gray-300 text-xs">8:00-9:00</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="glass-card p-5">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <button className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <h3 className="text-white font-medium text-sm">Feb 2023</h3>
                      <button className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {days.map((day) => (
                        <div key={day} className="text-center text-gray-400 text-xs font-medium py-1">
                          {day}
                        </div>
                      ))}
                    </div>

                    {dates.map((week, weekIndex) => (
                      <div key={weekIndex} className="grid grid-cols-7 gap-1">
                        {week.map((date, dateIndex) => (
                          <button
                            key={dateIndex}
                            onClick={() => date && setSelectedDate(date)}
                            disabled={!date}
                            className={`
                              h-9 rounded-lg text-xs font-medium transition-all
                              ${!date ? 'invisible' : ''}
                              ${date === selectedDate 
                                ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg' 
                                : 'text-gray-300 hover:bg-white/5'
                              }
                            `}
                          >
                            {date}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-medium mb-3 text-sm">In-Week Visits</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {appointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="glass-card p-4 hover:bg-white/15 transition-all cursor-pointer"
                      >
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <div className="text-white text-xs font-medium">{appointment.date}</div>
                          </div>
                          <div>
                            <h4 className="text-white text-sm font-semibold mb-2">{appointment.title}</h4>
                            <div className="flex items-center gap-2">
                              <img
                                src={appointment.doctorImage}
                                alt={appointment.doctor}
                                className="w-8 h-8 rounded-full"
                              />
                              <div>
                                <div className="text-sm text-white font-medium">{appointment.doctor}</div>
                                <div className="text-xs text-gray-300">{appointment.specialty}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
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

export default App;
