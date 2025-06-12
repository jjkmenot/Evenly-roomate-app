
import React from 'react';
import { Home, Users, DollarSign, CheckSquare, ShoppingCart } from 'lucide-react';

export const AppHeader = () => {
  return (
    <div className="space-y-6">
      <div className="text-center lg:text-left">
        <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
          RoomieTracker
        </h1>
        <p className="text-xl text-gray-600 font-medium">
          Your smart companion for seamless roommate living
        </p>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4">
        <div className="group flex items-center gap-3 px-4 py-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/30 shadow-sm hover:shadow-md hover:bg-white/80 transition-all duration-300 cursor-pointer">
          <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
            <Home className="h-5 w-5 text-blue-600" />
          </div>
          <span className="text-sm font-semibold text-gray-700 hidden lg:block">Smart Living</span>
        </div>
        
        <div className="group flex items-center gap-3 px-4 py-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/30 shadow-sm hover:shadow-md hover:bg-white/80 transition-all duration-300 cursor-pointer">
          <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
            <Users className="h-5 w-5 text-green-600" />
          </div>
          <span className="text-sm font-semibold text-gray-700 hidden lg:block">Group Management</span>
        </div>
        
        <div className="group flex items-center gap-3 px-4 py-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/30 shadow-sm hover:shadow-md hover:bg-white/80 transition-all duration-300 cursor-pointer">
          <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
            <DollarSign className="h-5 w-5 text-purple-600" />
          </div>
          <span className="text-sm font-semibold text-gray-700 hidden lg:block">Bill Splitting</span>
        </div>
        
        <div className="group flex items-center gap-3 px-4 py-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/30 shadow-sm hover:shadow-md hover:bg-white/80 transition-all duration-300 cursor-pointer">
          <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
            <CheckSquare className="h-5 w-5 text-red-600" />
          </div>
          <span className="text-sm font-semibold text-gray-700 hidden lg:block">Chore Tracking</span>
        </div>
        
        <div className="group flex items-center gap-3 px-4 py-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/30 shadow-sm hover:shadow-md hover:bg-white/80 transition-all duration-300 cursor-pointer col-span-2 lg:col-span-1">
          <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
            <ShoppingCart className="h-5 w-5 text-yellow-600" />
          </div>
          <span className="text-sm font-semibold text-gray-700 hidden lg:block">Shopping Lists</span>
        </div>
      </div>
    </div>
  );
};
