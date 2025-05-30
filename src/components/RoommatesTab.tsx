
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

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

interface RoommatesTabProps {
  roommates: Roommate[];
  bills: Bill[];
  chores: Chore[];
  onAddRoommate: () => void;
  onRemoveRoommate: (roommateId: string) => void;
}

export const RoommatesTab: React.FC<RoommatesTabProps> = ({ 
  roommates, 
  bills, 
  chores, 
  onAddRoommate, 
  onRemoveRoommate 
}) => {
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

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Roommates</CardTitle>
          <Button onClick={onAddRoommate} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Roommate
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roommates.map((roommate) => {
            const balance = getTotalBalance(roommate.id);
            const roommateChores = chores.filter(chore => chore.assignedTo === roommate.id);
            const completedChores = roommateChores.filter(chore => chore.completed).length;
            
            return (
              <div key={roommate.id} className="p-4 rounded-lg border bg-white/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${roommate.color} flex items-center justify-center text-white font-bold`}>
                      {roommate.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{roommate.name}</h3>
                      <p className="text-sm text-gray-600">{roommate.email}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onRemoveRoommate(roommate.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Balance:</span>
                    <span className={`font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {balance >= 0 ? '+' : ''}${balance.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Chores:</span>
                    <span className="text-sm font-medium">
                      {completedChores}/{roommateChores.length} done
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
