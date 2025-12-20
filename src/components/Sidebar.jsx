import React from 'react';
import { 
  Home, Brain, Calendar, Activity, Pill, User, Bell, Settings, LogOut
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { icon: Home, active: false },
    { icon: Brain, active: true },
    { icon: Calendar, active: false },
    { icon: Activity, active: false },
    { icon: Pill, active: false },
    { icon: User, active: false },
    { icon: Bell, active: false },
    { icon: Settings, active: false },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-20 bg-white/95 backdrop-blur-xl 
                    border-r border-gray-200/60 flex flex-col items-center py-8 z-50">
      {/* Logo */}
      <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-blue-600 
                      rounded-xl flex items-center justify-center mb-10 shadow-sm">
        <Brain className="w-6 h-6 text-white" />
      </div>

      {/* Menu Items */}
      <div className="flex-1 flex flex-col gap-2">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className={`icon-btn ${
              item.active
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-300/50'
                : 'text-gray-400 hover:text-blue-500'
            }`}
          >
            <item.icon className="w-5 h-5" />
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="icon-btn text-gray-400 hover:text-red-500">
        <LogOut className="w-5 h-5" />
      </div>
    </div>
  );
};

export default Sidebar;
