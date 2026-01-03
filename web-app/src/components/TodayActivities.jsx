import React, { useState } from 'react';
import { 
  Sun, Moon, Coffee, Dumbbell, Book, Users, Heart, 
  Brain, Droplets, Phone, Wind, Gamepad2, 
  CheckCircle2, Circle 
} from 'lucide-react';

const TodayActivities = () => {
  const [completedActivities, setCompletedActivities] = useState([]);

  const activities = [
    {
      id: 1,
      category: 'Physical',
      categoryColor: 'emerald',
      title: 'Morning Walk',
      description: '20-30 minutes at a comfortable pace',
      duration: '20 min',
      time: '8:00 AM',
      icon: Sun,
      bgGradient: 'from-emerald-50 to-emerald-100/50',
      borderColor: 'border-emerald-200',
      iconBg: 'bg-emerald-500',
      textColor: 'text-emerald-700',
      lightText: 'text-emerald-600',
    },
    {
      id: 2,
      category: 'Cognitive',
      categoryColor: 'purple',
      title: 'Memory Exercise',
      description: 'Short recall game (names, objects, or numbers)',
      duration: '15 min',
      time: '10:00 AM',
      icon: Brain,
      bgGradient: 'from-purple-50 to-purple-100/50',
      borderColor: 'border-purple-200',
      iconBg: 'bg-purple-500',
      textColor: 'text-purple-700',
      lightText: 'text-purple-600',
    },
    {
      id: 3,
      category: 'Wellness',
      categoryColor: 'blue',
      title: 'Hydration Check',
      description: 'Drink water and record how you feel',
      duration: '5 min',
      time: 'Throughout day',
      icon: Droplets,
      bgGradient: 'from-blue-50 to-blue-100/50',
      borderColor: 'border-blue-200',
      iconBg: 'bg-blue-500',
      textColor: 'text-blue-700',
      lightText: 'text-blue-600',
    },
    {
      id: 4,
      category: 'Social',
      categoryColor: 'rose',
      title: 'Social Interaction',
      description: 'Call a friend or family member',
      duration: '30 min',
      time: '2:00 PM',
      icon: Phone,
      bgGradient: 'from-rose-50 to-rose-100/50',
      borderColor: 'border-rose-200',
      iconBg: 'bg-rose-500',
      textColor: 'text-rose-700',
      lightText: 'text-rose-600',
    },
    {
      id: 5,
      category: 'Cognitive',
      categoryColor: 'amber',
      title: 'Reading Time',
      description: 'Read for 15-30 minutes',
      duration: '30 min',
      time: '4:00 PM',
      icon: Book,
      bgGradient: 'from-amber-50 to-amber-100/50',
      borderColor: 'border-amber-200',
      iconBg: 'bg-amber-500',
      textColor: 'text-amber-700',
      lightText: 'text-amber-600',
    },
    {
      id: 6,
      category: 'Wellness',
      categoryColor: 'teal',
      title: 'Mindfulness',
      description: 'Deep breathing or meditation session',
      duration: '10 min',
      time: '7:00 PM',
      icon: Wind,
      bgGradient: 'from-teal-50 to-teal-100/50',
      borderColor: 'border-teal-200',
      iconBg: 'bg-teal-500',
      textColor: 'text-teal-700',
      lightText: 'text-teal-600',
    },
    {
      id: 7,
      category: 'Physical',
      categoryColor: 'cyan',
      title: 'Light Stretching',
      description: 'Gentle stretches or yoga poses',
      duration: '15 min',
      time: '6:00 PM',
      icon: Dumbbell,
      bgGradient: 'from-cyan-50 to-cyan-100/50',
      borderColor: 'border-cyan-200',
      iconBg: 'bg-cyan-500',
      textColor: 'text-cyan-700',
      lightText: 'text-cyan-600',
    },
    {
      id: 8,
      category: 'Cognitive',
      categoryColor: 'indigo',
      title: 'Brain Games',
      description: 'Puzzles, crosswords, or sudoku',
      duration: '20 min',
      time: '3:00 PM',
      icon: Gamepad2,
      bgGradient: 'from-indigo-50 to-indigo-100/50',
      borderColor: 'border-indigo-200',
      iconBg: 'bg-indigo-500',
      textColor: 'text-indigo-700',
      lightText: 'text-indigo-600',
    },
  ];

  const toggleActivity = (id) => {
    setCompletedActivities(prev => 
      prev.includes(id) 
        ? prev.filter(activityId => activityId !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Today's Activities</h2>
        <p className="text-sm text-gray-500">
          Complete these activities to maintain your cognitive and physical health
        </p>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          const isCompleted = completedActivities.includes(activity.id);
          
          return (
            <div
              key={activity.id}
              className={`
                relative overflow-hidden rounded-2xl border-2 
                bg-gradient-to-br ${activity.bgGradient} ${activity.borderColor}
                transition-all duration-300 hover:shadow-lg
                ${isCompleted ? 'opacity-60' : 'opacity-100'}
              `}
            >
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleActivity(activity.id)}
                    className={`
                      flex-shrink-0 w-6 h-6 rounded-lg border-2 
                      flex items-center justify-center
                      transition-all duration-200 hover:scale-110
                      ${isCompleted 
                        ? `${activity.borderColor} ${activity.iconBg}` 
                        : `${activity.borderColor} bg-white`
                      }
                    `}
                  >
                    {isCompleted && (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    )}
                  </button>

                  {/* Category Badge */}
                  <span className={`
                    px-3 py-1 rounded-full text-xs font-semibold
                    ${activity.textColor} bg-white/80 backdrop-blur-sm
                  `}>
                    {activity.category}
                  </span>

                  {/* Icon */}
                  <div className={`
                    ml-auto flex-shrink-0 w-12 h-12 rounded-xl
                    ${activity.iconBg} shadow-lg
                    flex items-center justify-center
                  `}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className={`text-lg font-bold ${activity.textColor}`}>
                    {activity.title}
                  </h3>
                  <p className={`text-sm ${activity.lightText} leading-relaxed`}>
                    {activity.description}
                  </p>
                  
                  {/* Time Info */}
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${activity.iconBg}`} />
                      <span className={`text-xs font-semibold ${activity.textColor}`}>
                        {activity.duration}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${activity.iconBg}`} />
                      <span className={`text-xs font-semibold ${activity.textColor}`}>
                        {activity.time}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Completion Overlay */}
              {isCompleted && (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] 
                              flex items-center justify-center pointer-events-none">
                  <div className={`
                    ${activity.iconBg} rounded-full p-3 shadow-xl
                  `}>
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Summary */}
      <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-700">Progress Today</p>
            <p className="text-xs text-gray-500 mt-1">
              {completedActivities.length} of {activities.length} activities completed
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500"
                style={{ 
                  width: `${(completedActivities.length / activities.length) * 100}%` 
                }}
              />
            </div>
            <span className="text-sm font-bold text-gray-700">
              {Math.round((completedActivities.length / activities.length) * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayActivities;
