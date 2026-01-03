import React, { useState } from 'react';

export default function PatientActivities() {
  const [completedToday, setCompletedToday] = useState({});
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const activityLog = [
    { day: 'Today', activities: 3, time: '45 min' },
    { day: 'Yesterday', activities: 5, time: '1h 20m' },
    { day: 'Dec 25', activities: 4, time: '55 min' },
    { day: 'Dec 24', activities: 6, time: '1h 30m' },
  ];

  const activities = [
    {
      id: 1,
      title: 'Morning Walk',
      description: '20–30 minutes at a comfortable pace',
      tag: 'Physical',
      tagColor: 'emerald',
      duration: '20 min',
      time: '8:00 AM',
      bgGradient: 'from-emerald-500/20 to-emerald-600/10',
      borderColor: 'border-emerald-400/60',
    },
    {
      id: 2,
      title: 'Memory Exercise',
      description: 'Short recall game (names, objects, or numbers)',
      tag: 'Cognitive',
      tagColor: 'purple',
      duration: '15 min',
      time: '10:00 AM',
      bgGradient: 'from-purple-500/20 to-purple-600/10',
      borderColor: 'border-purple-400/60',
    },
    {
      id: 3,
      title: 'Hydration Check',
      description: 'Drink water and record how you feel',
      tag: 'Wellness',
      tagColor: 'cyan',
      duration: '5 min',
      time: 'Throughout day',
      bgGradient: 'from-cyan-500/20 to-cyan-600/10',
      borderColor: 'border-cyan-400/60',
    },
    {
      id: 4,
      title: 'Social Interaction',
      description: 'Call a friend or family member',
      tag: 'Social',
      tagColor: 'rose',
      duration: '30 min',
      time: '2:00 PM',
      bgGradient: 'from-rose-500/20 to-rose-600/10',
      borderColor: 'border-rose-400/60',
    },
    {
      id: 5,
      title: 'Reading Time',
      description: 'Read for 15-30 minutes',
      tag: 'Cognitive',
      tagColor: 'amber',
      duration: '30 min',
      time: '4:00 PM',
      bgGradient: 'from-amber-500/20 to-amber-600/10',
      borderColor: 'border-amber-400/60',
    },
    {
      id: 6,
      title: 'Mindfulness',
      description: 'Deep breathing or meditation session',
      tag: 'Wellness',
      tagColor: 'teal',
      duration: '10 min',
      time: '7:00 PM',
      bgGradient: 'from-teal-500/20 to-teal-600/10',
      borderColor: 'border-teal-400/60',
    },
    {
      id: 7,
      title: 'Light Stretching',
      description: 'Gentle stretches or yoga poses',
      tag: 'Physical',
      tagColor: 'lime',
      duration: '15 min',
      time: '6:00 PM',
      bgGradient: 'from-lime-500/20 to-lime-600/10',
      borderColor: 'border-lime-400/60',
    },
    {
      id: 8,
      title: 'Brain Games',
      description: 'Puzzles, crosswords, or sudoku',
      tag: 'Cognitive',
      tagColor: 'indigo',
      duration: '20 min',
      time: '3:00 PM',
      bgGradient: 'from-indigo-500/20 to-indigo-600/10',
      borderColor: 'border-indigo-400/60',
    },
  ];

  const toggleActivity = (id) => {
    setCompletedToday(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const completedCount = Object.values(completedToday).filter(Boolean).length;
  const completionRate = Math.round((completedCount / activities.length) * 100);

  return (
    <div className="w-full">
      <div className="mb-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">Daily Activities</h2>
            <p className="text-gray-300 text-sm">Track your wellness journey</p>
          </div>
        </div>

        {/* Compact Horizontal Stats */}
        <div className="glass-card p-6 mb-5 border border-white/10 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-xs text-gray-400 mb-1">TODAY</div>
              <div className="text-3xl font-bold text-white">{completedCount}<span className="text-lg text-gray-400">/{activities.length}</span></div>
              <div className="text-xs text-emerald-300 mt-1">{completionRate}% Complete</div>
            </div>
            <div className="w-px h-12 bg-white/10"></div>
            <div className="flex-1 text-center">
              <div className="text-xs text-gray-400 mb-1">STREAK</div>
              <div className="text-2xl font-bold text-blue-300">5 days</div>
              <div className="text-xs text-blue-200 mt-1">Keep going!</div>
            </div>
            <div className="w-px h-12 bg-white/10"></div>
            <div className="flex-1 text-center">
              <div className="text-xs text-gray-400 mb-1">TIME</div>
              <div className="text-2xl font-bold text-purple-300">{Math.round(completedCount * 18)} min</div>
              <div className="text-xs text-purple-200 mt-1">Today</div>
            </div>
            <div className="w-px h-12 bg-white/10"></div>
            <div className="flex-1 text-center">
              <div className="text-xs text-gray-400 mb-1">TOP CATEGORY</div>
              <div className="text-lg font-bold text-amber-300">Cognitive</div>
              <div className="text-xs text-amber-200 mt-1">Most active</div>
            </div>
          </div>
          <div className="mt-4 w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 h-2 rounded-full transition-all"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>

        {/* Weekly Calendar */}
        <div className="glass-card p-5 mb-5 border border-white/10 bg-green-500/5">
          <h3 className="text-white font-semibold mb-4">This Week</h3>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, idx) => {
              const isToday = idx === new Date().getDay();
              const completionForDay = idx === new Date().getDay() ? completionRate : 
                                      Math.floor(Math.random() * 40) + 60;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(idx)}
                  className={`p-3 rounded-xl transition-all border ${
                    isToday ? 'bg-gradient-to-br from-green-500 to-green-700 text-white border-white/20' :
                    selectedDay === idx ? 'bg-green-500/20 text-white border-white/20' :
                    'bg-green-500/5 text-gray-400 hover:bg-green-500/10 border-white/10'
                  }`}
                >
                  <div className="text-xs mb-1">{day}</div>
                  <div className="text-sm font-bold">{completionForDay}%</div>
                  <div className="w-full bg-white/20 rounded-full h-1 mt-1">
                    <div 
                      className="bg-white h-1 rounded-full"
                      style={{ width: `${completionForDay}%` }}
                    ></div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Cards */}
        <div className="lg:col-span-2">
          <h3 className="text-white font-semibold mb-4">Today's Activities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities.map((a) => (
              <div key={a.id} className={`
                relative overflow-hidden glass-card p-5 transition-colors duration-200 border border-white/10
                bg-gradient-to-br ${a.bgGradient}
                hover:border-white/20
                ${completedToday[a.id] ? 'ring-2 ring-white/20' : ''}
              `}>
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    {/* Tag */}
                    <div className="flex items-start justify-between mb-2">
                      <span className={`
                        px-3 py-1 rounded-full text-xs font-bold
                        bg-white/90 backdrop-blur-sm
                        text-${a.tagColor}-600
                        border border-white/20
                        shadow-sm
                      `}>
                        {a.tag}
                      </span>
                      
                      {/* Checkbox */}
                      <input 
                        type="checkbox"
                        checked={completedToday[a.id] || false}
                        onChange={() => toggleActivity(a.id)}
                        className="w-6 h-6 rounded-lg accent-green-500 cursor-pointer flex-shrink-0"
                      />
                    </div>
                    
                    {/* Title */}
                    <div className={`text-white font-bold text-base mb-2 ${
                      completedToday[a.id] ? 'line-through opacity-70' : ''
                    }`}>
                      {a.title}
                    </div>
                    
                    {/* Description */}
                    <div className="text-gray-200 text-sm mb-3 leading-relaxed">
                      {a.description}
                    </div>
                    
                    {/* Time Info */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${a.bgGradient} ${a.borderColor} border`} />
                        <span className="text-xs font-semibold text-white/90">{a.duration}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${a.bgGradient} ${a.borderColor} border`} />
                        <span className="text-xs font-semibold text-white/90">{a.time}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Completion Overlay */}
                {completedToday[a.id] && (
                  <div className="absolute top-2 right-2">
                    <div className={`
                      w-8 h-8 rounded-full 
                      bg-gradient-to-br from-green-400 to-green-600
                      flex items-center justify-center
                      shadow-lg ring-2 ring-white/30
                    `}>
                      <span className="text-white text-lg">✓</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Activity Log */}
        <div>
          <h3 className="text-white font-semibold mb-4">Recent Activity</h3>
          <div className="glass-card p-5">
            <div className="space-y-4">
              {activityLog.map((log, idx) => (
                <div key={idx} className="flex items-center justify-between pb-4 border-b border-white/10 last:border-0">
                  <div>
                    <div className="text-white text-sm font-medium">{log.day}</div>
                    <div className="text-gray-400 text-xs">{log.activities} activities</div>
                  </div>
                  <div className="text-right">
                    <div className="text-teal-400 text-sm font-semibold">{log.time}</div>
                    <div className="text-gray-400 text-xs">total</div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition-all">
              View Full History
            </button>
          </div>

          {/* Quick Tips */}
          <div className="glass-card p-5 mt-4">
            <h4 className="text-white font-semibold mb-3">Daily Tip</h4>
            <div className="text-gray-300 text-sm">
              Try to complete at least 30 minutes of physical activity and 30 minutes of cognitive exercises each day for optimal brain health.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
