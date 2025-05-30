import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, DollarSign, Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { BillForm } from '@/components/BillForm';
import { ChoreForm } from '@/components/ChoreForm';
import { RoommateForm } from '@/components/RoommateForm';
import { ReminderNotifications } from '@/components/ReminderNotifications';

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

const Index = () => {
  const [roommates, setRoommates] = useState<Roommate[]>([
    { id: '1', name: 'Alex', email: 'alex@example.com', color: 'bg-blue-500' },
    { id: '2', name: 'Sarah', email: 'sarah@example.com', color: 'bg-green-500' },
    { id: '3', name: 'Mike', email: 'mike@example.com', color: 'bg-purple-500' },
  ]);

  const [bills, setBills] = useState<Bill[]>([
    {
      id: '1',
      title: 'Electricity Bill',
      amount: 150,
      paidBy: '1',
      splitBetween: ['1', '2', '3'],
      date: '2024-05-25',
      category: 'Utilities',
      settled: false,
    },
    {
      id: '2',
      title: 'Groceries',
      amount: 89.50,
      paidBy: '2',
      splitBetween: ['1', '2', '3'],
      date: '2024-05-28',
      category: 'Food',
      settled: true,
    },
  ]);

  const [chores, setChores] = useState<Chore[]>([
    {
      id: '1',
      title: 'Clean Kitchen',
      assignedTo: '1',
      dueDate: '2024-06-01',
      completed: false,
      description: 'Deep clean kitchen counters, sink, and appliances',
      priority: 'high',
    },
    {
      id: '2',
      title: 'Take out trash',
      assignedTo: '2',
      dueDate: '2024-05-30',
      completed: true,
      completedDate: '2024-05-29',
      description: 'Take out all trash bins and recycling',
      priority: 'medium',
    },
    {
      id: '3',
      title: 'Vacuum living room',
      assignedTo: '3',
      dueDate: '2024-06-02',
      completed: false,
      description: 'Vacuum the entire living room and under furniture',
      priority: 'low',
    },
  ]);

  const [showBillForm, setShowBillForm] = useState(false);
  const [showChoreForm, setShowChoreForm] = useState(false);
  const [showRoommateForm, setShowRoommateForm] = useState(false);

  const removeRoommate = (roommateId: string) => {
    // Remove roommate from the list
    setRoommates(roommates.filter(r => r.id !== roommateId));
    
    // Remove their bills and chores
    setBills(bills.filter(bill => 
      bill.paidBy !== roommateId && !bill.splitBetween.includes(roommateId)
    ));
    setChores(chores.filter(chore => chore.assignedTo !== roommateId));
  };

  const getRoommateName = (id: string) => {
    return roommates.find(r => r.id === id)?.name || 'Unknown';
  };

  const getRoommateColor = (id: string) => {
    return roommates.find(r => r.id === id)?.color || 'bg-gray-500';
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

  const getPendingChoresCount = () => {
    return chores.filter(chore => !chore.completed).length;
  };

  const getOverdueChoresCount = () => {
    const today = new Date().toISOString().split('T')[0];
    return chores.filter(chore => !chore.completed && chore.dueDate < today).length;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleChoreComplete = (choreId: string) => {
    setChores(chores.map(chore => 
      chore.id === choreId 
        ? { 
            ...chore, 
            completed: !chore.completed,
            completedDate: !chore.completed ? new Date().toISOString().split('T')[0] : undefined
          }
        : chore
    ));
  };

  const markBillSettled = (billId: string) => {
    setBills(bills.map(bill => 
      bill.id === billId ? { ...bill, settled: true } : bill
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">RoomieTracker</h1>
          <p className="text-lg text-gray-600">Manage bills, chores, and roommate responsibilities with ease</p>
        </header>

        {/* Add Reminder Notifications */}
        <ReminderNotifications roommates={roommates} bills={bills} chores={chores} />

        {/* Quick Stats */}
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

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px] mx-auto">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="bills">Bills</TabsTrigger>
            <TabsTrigger value="chores">Chores</TabsTrigger>
            <TabsTrigger value="roommates">Roommates</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
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
          </TabsContent>

          <TabsContent value="bills" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Bills & Expenses</CardTitle>
                  <Button onClick={() => setShowBillForm(true)} className="bg-blue-600 hover:bg-blue-700">
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
                          onClick={() => markBillSettled(bill.id)}
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
          </TabsContent>

          <TabsContent value="chores" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Household Chores</CardTitle>
                  <Button onClick={() => setShowChoreForm(true)} className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Chore
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chores.map((chore) => {
                    const isOverdue = !chore.completed && chore.dueDate < new Date().toISOString().split('T')[0];
                    
                    return (
                      <div key={chore.id} className={`p-4 rounded-lg border ${chore.completed ? 'bg-green-50/50' : isOverdue ? 'bg-red-50/50' : 'bg-white/50'}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <button
                                onClick={() => toggleChoreComplete(chore.id)}
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  chore.completed 
                                    ? 'bg-green-500 border-green-500 text-white' 
                                    : 'border-gray-300 hover:border-green-500'
                                }`}
                              >
                                {chore.completed && <CheckCircle className="h-3 w-3" />}
                              </button>
                              <h3 className={`font-semibold ${chore.completed ? 'line-through text-gray-500' : ''}`}>
                                {chore.title}
                              </h3>
                              <Badge className={getPriorityColor(chore.priority)}>
                                {chore.priority}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-2">{chore.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>Assigned to: {getRoommateName(chore.assignedTo)}</span>
                              <span>Due: {chore.dueDate}</span>
                              {chore.completed && chore.completedDate && (
                                <span>Completed: {chore.completedDate}</span>
                              )}
                            </div>
                          </div>
                          <div className={`w-3 h-3 rounded-full ${getRoommateColor(chore.assignedTo)}`}></div>
                        </div>
                        
                        {isOverdue && (
                          <Badge variant="destructive" className="text-xs">
                            Overdue
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roommates" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Roommates</CardTitle>
                  <Button onClick={() => setShowRoommateForm(true)} className="bg-purple-600 hover:bg-purple-700">
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
                            onClick={() => removeRoommate(roommate.id)}
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
          </TabsContent>
        </Tabs>

        {/* Modals */}
        {showBillForm && (
          <BillForm
            roommates={roommates}
            onSubmit={(bill) => {
              setBills([...bills, { ...bill, id: Date.now().toString() }]);
              setShowBillForm(false);
            }}
            onClose={() => setShowBillForm(false)}
          />
        )}

        {showChoreForm && (
          <ChoreForm
            roommates={roommates}
            onSubmit={(chore) => {
              setChores([...chores, { ...chore, id: Date.now().toString(), completed: false }]);
              setShowChoreForm(false);
            }}
            onClose={() => setShowChoreForm(false)}
          />
        )}

        {showRoommateForm && (
          <RoommateForm
            onSubmit={(roommate) => {
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500', 'bg-pink-500'];
              const newRoommate = {
                ...roommate,
                id: Date.now().toString(),
                color: colors[roommates.length % colors.length]
              };
              setRoommates([...roommates, newRoommate]);
              setShowRoommateForm(false);
            }}
            onClose={() => setShowRoommateForm(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
