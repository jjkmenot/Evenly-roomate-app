import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BillForm } from '@/components/BillForm';
import { ChoreForm } from '@/components/ChoreForm';
import { RoommateForm } from '@/components/RoommateForm';
import { GroupForm } from '@/components/GroupForm';
import { ShoppingItemForm } from '@/components/ShoppingItemForm';
import { ReminderNotifications } from '@/components/ReminderNotifications';
import { QuickStats } from '@/components/QuickStats';
import { DashboardTab } from '@/components/DashboardTab';
import { BillsTab } from '@/components/BillsTab';
import { ChoresTab } from '@/components/ChoresTab';
import { RoommatesTab } from '@/components/RoommatesTab';
import { ShoppingListTab } from '@/components/ShoppingListTab';
import { AppHeader } from '@/components/AppHeader';
import { UserProfileDropdown } from '@/components/UserProfileDropdown';
import { AnnouncementsSection } from '@/components/AnnouncementsSection';
import { useRoommates } from '@/hooks/useRoommates';

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
  const { roommates, groups, addRoommate, removeRoommate, createGroup, deleteGroup, isLoading } = useRoommates();

  // Start with empty bills and chores - these will be managed by database later
  const [bills, setBills] = useState<Bill[]>([]);
  const [chores, setChores] = useState<Chore[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);

  const [showBillForm, setShowBillForm] = useState(false);
  const [showChoreForm, setShowChoreForm] = useState(false);
  const [showRoommateForm, setShowRoommateForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showShoppingForm, setShowShoppingForm] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleRemoveRoommate = (roommateId: string) => {
    removeRoommate(roommateId);
    // Remove bills and chores associated with this roommate
    setBills(bills.filter(bill => 
      bill.paidBy !== roommateId && !bill.splitBetween.includes(roommateId)
    ));
    setChores(chores.filter(chore => chore.assignedTo !== roommateId));
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Hide roommate form when navigating away from roommates tab
    if (value !== 'roommates') {
      setShowRoommateForm(false);
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

  const markShoppingItemPurchased = (itemId: string) => {
    setShoppingItems(shoppingItems.map(item =>
      item.id === itemId
        ? {
            ...item,
            purchased: true,
            purchasedBy: roommates[0]?.id || '1', // Use first roommate or fallback
            purchasedDate: new Date().toISOString().split('T')[0]
          }
        : item
    ));
  };

  const removeShoppingItem = (itemId: string) => {
    setShoppingItems(shoppingItems.filter(item => item.id !== itemId));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading roommates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <AppHeader />
          <UserProfileDropdown />
        </div>

        <ReminderNotifications roommates={roommates} bills={bills} chores={chores} />

        <QuickStats bills={bills} chores={chores} />

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-[500px] mx-auto">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="bills">Bills</TabsTrigger>
            <TabsTrigger value="chores">Chores</TabsTrigger>
            <TabsTrigger value="shopping">Shopping</TabsTrigger>
            <TabsTrigger value="roommates">Roommates</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <AnnouncementsSection roommates={roommates} groups={groups} />
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
              groups={groups}
              bills={bills} 
              chores={chores} 
              onAddRoommate={() => setShowRoommateForm(true)}
              onCreateGroup={() => setShowGroupForm(true)}
              onRemoveRoommate={handleRemoveRoommate}
              onDeleteGroup={deleteGroup}
            />
            
            {/* Show roommate form only in roommates tab and when requested */}
            {showRoommateForm && (
              <div className="mt-6">
                <RoommateForm
                  groups={groups}
                  onSubmit={(roommate) => {
                    addRoommate(roommate);
                    setShowRoommateForm(false);
                  }}
                  onClose={() => setShowRoommateForm(false)}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Other modals (not in roommates tab) */}
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

        {showGroupForm && (
          <GroupForm
            onSubmit={(groupName) => {
              createGroup(groupName);
              setShowGroupForm(false);
            }}
            onClose={() => setShowGroupForm(false)}
          />
        )}

        {showShoppingForm && (
          <ShoppingItemForm
            onSubmit={(item) => {
              setShoppingItems([...shoppingItems, { ...item, id: Date.now().toString() }]);
              setShowShoppingForm(false);
            }}
            onClose={() => setShowShoppingForm(false)}
            currentUserId={roommates[0]?.id || '1'}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
