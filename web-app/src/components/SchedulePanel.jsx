import React, { useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';

const SchedulePanel = () => {
  const [selectedDate, setSelectedDate] = useState(25);
  const dates = [25, 26, 27, 28];

  const events = [
    {
      title: 'Doctors appointment',
      subtitle: 'Neurologist',
      time: '8:00 AM - 9:00 AM (UTC)',
      color: 'bg-blue-100',
      textColor: 'text-blue-600',
      icon: '🩺',
    },
    {
      title: 'Daily exercise',
      subtitle: 'Exercise for brain activity',
      time: '12:00 AM - 1:00 PM (UTC)',
      color: 'bg-cyan-100',
      textColor: 'text-cyan-600',
      icon: '🏃',
      hasButton: true,
    },
    {
      title: 'Doctors appointment',
      subtitle: 'Family doctor',
      time: '2:00 PM - 3:00 PM (UTC)',
      color: 'bg-blue-50',
      textColor: 'text-blue-500',
      icon: '👨‍⚕️',
    },
  ];

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-white/95 backdrop-blur-xl 
                    border-l border-gray-200/60 flex flex-col p-8 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 
                            w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200
                     focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm transition-all"
          />
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Tomas"
            alt="Tomas Brown"
            className="w-12 h-12 rounded-full bg-blue-200"
          />
          <div>
            <p className="text-xs text-gray-400">Patient</p>
            <p className="font-semibold text-gray-800">Tomas Brown</p>
          </div>
          <ChevronRight className="ml-auto w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Schedule */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">My schedule</h2>
          <button className="text-xs text-gray-400 hover:text-blue-500">Clear</button>
        </div>

        {/* Date Selector */}
        <div className="flex gap-4 mb-8">
          {dates.map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`flex-1 transition-all duration-300 ${
                selectedDate === date
                  ? 'text-gray-800'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className={`text-3xl font-bold mb-1 ${
                selectedDate === date ? 'text-gray-800' : 'text-gray-300'
              }`}>
                {date}
              </div>
              <div className="text-xs">Oct</div>
            </button>
          ))}
        </div>

        {/* Time Markers */}
        <div className="space-y-12 mb-8">
          {['8 am', '12 am', '2 pm'].map((time, index) => (
            <div key={time} className="relative">
              <p className="text-xs text-gray-400 mb-4">{time}</p>
              <div className={`${events[index].color} rounded-2xl p-5 
                              transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md border border-gray-100`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className={`font-semibold ${events[index].textColor} text-sm mb-1`}>
                      {events[index].title}
                    </h3>
                    <p className="text-xs text-gray-500">{events[index].subtitle}</p>
                  </div>
                  <span className="text-xl">{events[index].icon}</span>
                </div>
                <p className="text-xs text-gray-400 mt-3">{events[index].time}</p>
                {events[index].hasButton && (
                  <button className="mt-3 px-4 py-1.5 bg-white rounded-lg text-xs 
                                   font-medium text-blue-600 hover:bg-gray-50 transition-all border border-gray-200">
                    Exercise
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Exercise Card */}
        <div className="gradient-bg rounded-2xl p-8 text-white relative overflow-hidden
                       hover:-translate-y-0.5 transition-all duration-300 cursor-pointer shadow-lg">
          <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/20 
                         backdrop-blur-sm flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm 
                           flex items-center justify-center mb-16">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Your</h2>
            <h2 className="text-2xl font-bold">Exercise</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePanel;
