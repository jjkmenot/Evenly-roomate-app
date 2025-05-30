
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

interface BillsTabProps {
  bills: Bill[];
  roommates: Roommate[];
  onAddBill: () => void;
  onMarkBillSettled: (billId: string) => void;
}

export const BillsTab: React.FC<BillsTabProps> = ({ bills, roommates, onAddBill, onMarkBillSettled }) => {
  const getRoommateName = (id: string) => {
    return roommates.find(r => r.id === id)?.name || 'Unknown';
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Bills & Expenses</CardTitle>
          <Button onClick={onAddBill} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Bill
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bills.map((bill) => (
            <div key={bill.id} className="p-4 rounded-lg border bg-white/50">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{bill.title}</h3>
                  <p className="text-gray-600">
                    Paid by {getRoommateName(bill.paidBy)} • {bill.category} • {bill.date}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">${bill.amount}</p>
                  <Badge variant={bill.settled ? "default" : "secondary"}>
                    {bill.settled ? 'Settled' : 'Pending'}
                  </Badge>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-sm text-gray-600">Split between:</span>
                {bill.splitBetween.map((roommateId) => (
                  <Badge key={roommateId} variant="outline" className="text-xs">
                    {getRoommateName(roommateId)}
                  </Badge>
                ))}
              </div>

              {!bill.settled && (
                <Button 
                  onClick={() => onMarkBillSettled(bill.id)}
                  variant="outline" 
                  size="sm"
                  className="mt-2"
                >
                  Mark as Settled
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
