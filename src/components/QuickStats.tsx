
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Bill {
  id: string;
  title: string;
  amount: number;
  paidBy: string;
  splitBetween: string[];
  date: string;
  category: string;
  settled: boolean;
}

interface Chore {
  id: string;
  title: string;
  assignedTo: string;
  dueDate: string;
  completed: boolean;
  completedDate?: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

interface QuickStatsProps {
  bills: Bill[];
  chores: Chore[];
}

export const QuickStats: React.FC<QuickStatsProps> = ({ bills, chores }) => {
  const getCompletedChoresCount = () => {
    return chores.filter(chore => chore.completed).length;
  };

  const getPendingChoresCount = () => {
    return chores.filter(chore => !chore.completed).length;
  };

  const getOverdueChoresCount = () => {
    const today = new Date().toISOString().split('T')[0];
    return chores.filter(chore => !chore.completed && chore.dueDate < today).length;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bills</p>
              <p className="text-2xl font-bold text-gray-900">{bills.length}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Chores</p>
              <p className="text-2xl font-bold text-gray-900">{getCompletedChoresCount()}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Chores</p>
              <p className="text-2xl font-bold text-gray-900">{getPendingChoresCount()}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Chores</p>
              <p className="text-2xl font-bold text-gray-900">{getOverdueChoresCount()}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
