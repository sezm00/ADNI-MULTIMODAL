import React from 'react';
import { Heart, Thermometer, Droplets, Activity, TrendingUp, ArrowUpRight, Pill, Wind, AlertCircle, Scan, Calendar, Clock } from 'lucide-react';

export const PatientInfoCard = () => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-blue-500 overflow-hidden">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=William" 
            alt="William"
            className="w-full h-full"
          />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800">William</p>
        </div>
        <button className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      <div className="space-y-5">
        {/* Heart Rate */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Heart Rate</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-800">110</span>
            <span className="text-base text-gray-400">bpm</span>
          </div>
        </div>

        {/* Temperature */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Temperature</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-800">34.7</span>
            <span className="text-base text-gray-400">°C</span>
          </div>
        </div>

        {/* Oxygen */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Oxygen</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-800">98</span>
            <span className="text-base text-gray-400">%</span>
          </div>
        </div>
      </div>

      <button className="mt-6 w-12 h-12 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center ml-auto">
        <ArrowUpRight className="w-5 h-5 text-white" />
      </button>
    </div>
  );
};

// Small Metric Card (for top row metrics)
export const SmallMetricCard = ({ title, value, icon: Icon, trend, bgColor = "bg-gray-50" }) => {
  return (
    <div className={`${bgColor} rounded-2xl p-4 hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-100`}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
          {Icon && <Icon className="w-5 h-5 text-gray-700" />}
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs font-semibold text-green-600">
            <TrendingUp className="w-3 h-3" />
            <span>{trend}</span>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
};

// Health Metric Card with percentage
export const HealthMetricCard = ({ title, percentage, icon: Icon, color = "blue", subtitle }) => {
  const colorClasses = {
    blue: "from-blue-400 to-blue-500",
    green: "from-green-400 to-green-500",
    purple: "from-purple-400 to-purple-500",
    orange: "from-orange-400 to-orange-500"
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-sm`}>
          {Icon && <Icon className="w-5 h-5 text-white" />}
        </div>
        <button className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
          <ArrowUpRight className="w-3 h-3 text-gray-600" />
        </button>
      </div>
      <p className="text-sm font-semibold text-gray-800 mb-1">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 mb-3">{subtitle}</p>}
      {percentage && (
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-gray-800">{percentage}</span>
          <span className="text-lg text-gray-400">%</span>
        </div>
      )}
    </div>
  );
};

// Scan Cardiology Card
export const ScanCard = () => {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-gray-800">Scan</p>
          <p className="text-xs text-gray-500">Cardiology</p>
        </div>
        <button className="w-8 h-8 rounded-xl bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-colors">
          <ArrowUpRight className="w-4 h-4 text-white" />
        </button>
      </div>
      <div className="flex items-baseline gap-1 mt-4">
        <span className="text-3xl font-bold text-gray-800">1,276</span>
        <span className="text-sm text-gray-400">scans</span>
      </div>
    </div>
  );
};

// Medical Image Card (Osteoporosis)
export const MedicalImageCard = () => {
  return (
    <div className="bg-gradient-to-br from-gray-700 via-gray-600 to-gray-700 rounded-3xl p-6 shadow-xl relative overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer h-full">
      {/* Background medical image effect */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-500/50 to-transparent" />
      </div>
      
      {/* Control buttons */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center transition-colors">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
          </svg>
        </button>
        <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center transition-colors">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
        </button>
      </div>

      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center transition-colors">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full">
        <p className="text-xs text-gray-300 mb-2">Diagnostic Report</p>
        <h3 className="text-2xl font-bold text-white mb-4">Osteoporosis</h3>
        <button className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center transition-colors self-end">
          <ArrowUpRight className="w-5 h-5 text-gray-800" />
        </button>
      </div>
    </div>
  );
};

// Time Schedule Card
export const TimeScheduleCard = () => {
  return (
    <div className="bg-gray-100 rounded-2xl p-4 border border-gray-200">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
          <Calendar className="w-5 h-5 text-gray-700" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">Monday</p>
          <p className="text-xs text-gray-500">10:00-11:30</p>
        </div>
      </div>
    </div>
  );
};

// Respiratory Chart Card
export const RespiratoryCard = () => {
  const chartData = [40, 45, 50, 48, 52, 55, 58, 60, 58, 62, 65, 63];
  
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Respiratory</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-800">25</span>
            <span className="text-lg text-gray-400">%</span>
          </div>
        </div>
        <button className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
          <ArrowUpRight className="w-3 h-3 text-gray-600" />
        </button>
      </div>
      
      {/* Mini bar chart */}
      <div className="flex items-end gap-1 h-16">
        {chartData.map((value, index) => (
          <div 
            key={index}
            className="flex-1 bg-gradient-to-t from-blue-400 to-blue-300 rounded-sm hover:from-blue-500 hover:to-blue-400 transition-colors cursor-pointer"
            style={{ height: `${value}%` }}
          />
        ))}
      </div>
    </div>
  );
};

// Influenza Card
export const InfluenzaCard = () => {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center shadow-sm">
          <AlertCircle className="w-5 h-5 text-white" />
        </div>
        <button className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
          <ArrowUpRight className="w-3 h-3 text-gray-600" />
        </button>
      </div>
      <p className="text-sm font-semibold text-gray-800">Influenza</p>
    </div>
  );
};

// Respiratory Rate Small Card
export const RespiratoryRateCard = () => {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500">Respiratory</p>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span className="text-xs text-gray-600">523</span>
        </div>
      </div>
    </div>
  );
};

// Heart Ring Progress Card
export const HeartRingCard = () => {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="#e5e7eb"
              strokeWidth="4"
              fill="none"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="#3b82f6"
              strokeWidth="4"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 20}`}
              strokeDashoffset={`${2 * Math.PI * 20 * (1 - 0.89)}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Heart className="w-5 h-5 text-blue-500" />
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500">Heart ring</p>
          <p className="text-sm font-semibold text-gray-800">89%</p>
        </div>
      </div>
    </div>
  );
};
