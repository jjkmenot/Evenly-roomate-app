
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, DollarSign, CheckCircle } from 'lucide-react';

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

interface ReminderNotificationsProps {
  roommates: Roommate[];
  bills: Bill[];
  chores: Chore[];
}

export const ReminderNotifications: React.FC<ReminderNotificationsProps> = ({ roommates, bills, chores }) => {
  const getRoommateName = (id: string) => {
    return roommates.find(r => r.id === id)?.name || 'Unknown';
  };

  const getUpcomingReminders = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const reminders = [];

    // Check for overdue bills (1 day past due)
    const overdueBills = bills.filter(bill => {
      if (bill.settled) return false;
      const billDate = new Date(bill.date);
      const daysPast = Math.floor((today.getTime() - billDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysPast >= 1;
    });

    overdueBills.forEach(bill => {
      bill.splitBetween.forEach(roommateId => {
        if (roommateId !== bill.paidBy) {
          reminders.push({
            type: 'bill',
            message: `${getRoommateName(roommateId)} hasn't paid their share of "${bill.title}" ($${(bill.amount / bill.splitBetween.length).toFixed(2)})`,
            roommateId,
            priority: 'high'
          });
        }
      });
    });

    // Check for chores due tomorrow
    const choresDueTomorrow = chores.filter(chore => 
      !chore.completed && chore.dueDate === tomorrowStr
    );

    choresDueTomorrow.forEach(chore => {
      reminders.push({
        type: 'chore',
        message: `${getRoommateName(chore.assignedTo)} has "${chore.title}" due tomorrow`,
        roommateId: chore.assignedTo,
        priority: chore.priority
      });
    });

    // Check for overdue chores
    const overdueChores = chores.filter(chore => {
      if (chore.completed) return false;
      return chore.dueDate < today.toISOString().split('T')[0];
    });

    overdueChores.forEach(chore => {
      reminders.push({
        type: 'chore',
        message: `${getRoommateName(chore.assignedTo)} has overdue chore: "${chore.title}"`,
        roommateId: chore.assignedTo,
        priority: 'high'
      });
    });

    return reminders;
  };

  const reminders = getUpcomingReminders();

  if (reminders.length === 0) {
    return null;
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="bg-orange-50/70 backdrop-blur-sm border-orange-200 shadow-lg mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Bell className="h-5 w-5" />
          Reminders & Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {reminders.map((reminder, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-white/50">
              <div className="flex items-center gap-3">
                {reminder.type === 'bill' ? (
                  <DollarSign className="h-4 w-4 text-red-500" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                )}
                <span className="text-sm">{reminder.message}</span>
              </div>
              <Badge className={getPriorityColor(reminder.priority)}>
                {reminder.priority}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
