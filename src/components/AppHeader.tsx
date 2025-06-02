
import React from 'react';
import { Home, Users, DollarSign, CheckSquare, ShoppingCart } from 'lucide-react';

export const AppHeader = () => {
  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-800 mb-2">RoomieTracker</h1>
      <p className="text-gray-600 mb-8">Manage bills, chores, and shopping with your roommates</p>
      
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="flex items-center gap-2 px-4 py-2 bg-white/50 rounded-lg">
          <Home className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium">Smart Living</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/50 rounded-lg">
          <Users className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium">Group Management</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/50 rounded-lg">
          <DollarSign className="h-5 w-5 text-purple-600" />
          <span className="text-sm font-medium">Bill Splitting</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/50 rounded-lg">
          <CheckSquare className="h-5 w-5 text-red-600" />
          <span className="text-sm font-medium">Chore Tracking</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/50 rounded-lg">
          <ShoppingCart className="h-5 w-5 text-yellow-600" />
          <span className="text-sm font-medium">Shopping Lists</span>
        </div>
      </div>
    </div>
  );
};
