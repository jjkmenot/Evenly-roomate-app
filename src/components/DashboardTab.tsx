
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users } from 'lucide-react';

interface Roommate {
  id: string;
  name: string;
  email: string;
  color: string;
}

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

interface DashboardTabProps {
  roommates: Roommate[];
  bills: Bill[];
  chores: Chore[];
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ roommates, bills, chores }) => {
  const getRoommateName = (id: string) => {
    return roommates.find(r => r.id === id)?.name || 'Unknown';
  };

  const calculateOwedAmount = (bill: Bill, roommateId: string) => {
    if (bill.settled) return 0;
    if (bill.paidBy === roommateId) {
      const splitAmount = bill.amount / bill.splitBetween.length;
      return (bill.splitBetween.length - 1) * splitAmount;
    } else if (bill.splitBetween.includes(roommateId)) {
      return -(bill.amount / bill.splitBetween.length);
    }
    return 0;
  };

  const getTotalBalance = (roommateId: string) => {
    return bills.reduce((total, bill) => total + calculateOwedAmount(bill, roommateId), 0);
  };

  const getCompletedChoresCount = () => {
    return chores.filter(chore => chore.completed).length;
  };

  return (
    <div className="space-y-6">
      {/* Roommate Balances */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Roommate Balances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roommates.map((roommate) => {
              const balance = getTotalBalance(roommate.id);
              return (
                <div key={roommate.id} className="p-4 rounded-lg border bg-white/50">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-3 h-3 rounded-full ${roommate.color}`}></div>
                    <span className="font-medium">{roommate.name}</span>
                  </div>
                  <p className={`text-lg font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {balance >= 0 ? '+' : ''}${balance.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {balance >= 0 ? 'Owed to you' : 'You owe'}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Bills */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Recent Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bills.slice(0, 3).map((bill) => (
              <div key={bill.id} className="flex items-center justify-between p-3 rounded-lg border bg-white/50">
                <div>
                  <p className="font-medium">{bill.title}</p>
                  <p className="text-sm text-gray-600">
                    Paid by {getRoommateName(bill.paidBy)} • {bill.date}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${bill.amount}</p>
                  <Badge variant={bill.settled ? "default" : "secondary"}>
                    {bill.settled ? 'Settled' : 'Pending'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chore Progress */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Chore Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-gray-600">
                  {getCompletedChoresCount()}/{chores.length} completed
                </span>
              </div>
              <Progress value={(getCompletedChoresCount() / chores.length) * 100} className="h-2" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {roommates.map((roommate) => {
                const roommateChores = chores.filter(chore => chore.assignedTo === roommate.id);
                const completedCount = roommateChores.filter(chore => chore.completed).length;
                const progress = roommateChores.length > 0 ? (completedCount / roommateChores.length) * 100 : 0;
                
                return (
                  <div key={roommate.id} className="p-3 rounded-lg border bg-white/50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${roommate.color}`}></div>
                      <span className="text-sm font-medium">{roommate.name}</span>
                    </div>
                    <Progress value={progress} className="h-1 mb-1" />
                    <p className="text-xs text-gray-600">
                      {completedCount}/{roommateChores.length} done
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
