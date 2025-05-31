import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BillForm } from '@/components/BillForm';
import { ChoreForm } from '@/components/ChoreForm';
import { RoommateForm } from '@/components/RoommateForm';
import { ShoppingItemForm } from '@/components/ShoppingItemForm';
import { ReminderNotifications } from '@/components/ReminderNotifications';
import { QuickStats } from '@/components/QuickStats';
import { DashboardTab } from '@/components/DashboardTab';
import { BillsTab } from '@/components/BillsTab';
import { ChoresTab } from '@/components/ChoresTab';
import { RoommatesTab } from '@/components/RoommatesTab';
import { ShoppingListTab } from '@/components/ShoppingListTab';
import { AppHeader } from '@/components/AppHeader';

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

interface ShoppingItem {
  id: string;
  item: string;
  addedBy: string;
  dateAdded: string;
  purchased: boolean;
  purchasedBy?: string;
  purchasedDate?: string;
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

  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([
    {
      id: '1',
      item: 'Toilet Paper',
      addedBy: '1',
      dateAdded: '2024-05-28',
      purchased: false,
    },
    {
      id: '2',
      item: 'Dish Soap',
      addedBy: '2',
      dateAdded: '2024-05-27',
      purchased: true,
      purchasedBy: '3',
      purchasedDate: '2024-05-29',
    },
  ]);

  const [showBillForm, setShowBillForm] = useState(false);
  const [showChoreForm, setShowChoreForm] = useState(false);
  const [showRoommateForm, setShowRoommateForm] = useState(false);
  const [showShoppingForm, setShowShoppingForm] = useState(false);

  const removeRoommate = (roommateId: string) => {
    setRoommates(roommates.filter(r => r.id !== roommateId));
    setBills(bills.filter(bill => 
      bill.paidBy !== roommateId && !bill.splitBetween.includes(roommateId)
    ));
    setChores(chores.filter(chore => chore.assignedTo !== roommateId));
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

  const markShoppingItemPurchased = (itemId: string) => {
    setShoppingItems(shoppingItems.map(item =>
      item.id === itemId
        ? {
            ...item,
            purchased: true,
            purchasedBy: '1', // In a real app, this would be the current user
            purchasedDate: new Date().toISOString().split('T')[0]
          }
        : item
    ));
  };

  const removeShoppingItem = (itemId: string) => {
    setShoppingItems(shoppingItems.filter(item => item.id !== itemId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <AppHeader />

        <ReminderNotifications roommates={roommates} bills={bills} chores={chores} />

        <QuickStats bills={bills} chores={chores} />

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-[500px] mx-auto">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="bills">Bills</TabsTrigger>
            <TabsTrigger value="chores">Chores</TabsTrigger>
            <TabsTrigger value="shopping">Shopping</TabsTrigger>
            <TabsTrigger value="roommates">Roommates</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <DashboardTab roommates={roommates} bills={bills} chores={chores} />
          </TabsContent>

          <TabsContent value="bills" className="space-y-6">
            <BillsTab 
              bills={bills} 
              roommates={roommates} 
              onAddBill={() => setShowBillForm(true)}
              onMarkBillSettled={markBillSettled}
            />
          </TabsContent>

          <TabsContent value="chores" className="space-y-6">
            <ChoresTab 
              chores={chores} 
              roommates={roommates} 
              onAddChore={() => setShowChoreForm(true)}
              onToggleChore={toggleChoreComplete}
            />
          </TabsContent>

          <TabsContent value="shopping" className="space-y-6">
            <ShoppingListTab 
              items={shoppingItems}
              roommates={roommates}
              onAddItem={() => setShowShoppingForm(true)}
              onMarkPurchased={markShoppingItemPurchased}
              onRemoveItem={removeShoppingItem}
            />
          </TabsContent>

          <TabsContent value="roommates" className="space-y-6">
            <RoommatesTab 
              roommates={roommates} 
              bills={bills} 
              chores={chores} 
              onAddRoommate={() => setShowRoommateForm(true)}
              onRemoveRoommate={removeRoommate}
            />
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

        {showShoppingForm && (
          <ShoppingItemForm
            onSubmit={(item) => {
              setShoppingItems([...shoppingItems, { ...item, id: Date.now().toString() }]);
              setShowShoppingForm(false);
            }}
            onClose={() => setShowShoppingForm(false)}
            currentUserId="1" // In a real app, this would be the logged-in user's ID
          />
        )}
      </div>
    </div>
  );
};

export default Index;
