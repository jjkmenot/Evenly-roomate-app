
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-purple-400 animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-gray-700 font-medium">Loading your roommate experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-200/30 to-purple-200/30 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-tr from-indigo-200/30 to-pink-200/30 blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <AppHeader />
          <UserProfileDropdown />
        </div>

        {/* Notifications and Stats */}
        <div className="space-y-6 mb-8">
          <ReminderNotifications roommates={roommates} bills={bills} chores={chores} />
          <QuickStats bills={bills} chores={chores} />
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid w-full grid-cols-5 lg:w-[600px] h-12 p-1 bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg rounded-xl">
              <TabsTrigger 
                value="dashboard" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 rounded-lg font-medium"
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="bills" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 rounded-lg font-medium"
              >
                Bills
              </TabsTrigger>
              <TabsTrigger 
                value="chores" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 rounded-lg font-medium"
              >
                Chores
              </TabsTrigger>
              <TabsTrigger 
                value="shopping" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 rounded-lg font-medium"
              >
                Shopping
              </TabsTrigger>
              <TabsTrigger 
                value="roommates" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 rounded-lg font-medium"
              >
                Roommates
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="space-y-8 animate-fade-in">
            <AnnouncementsSection roommates={roommates} groups={groups} />
            <DashboardTab roommates={roommates} bills={bills} chores={chores} />
          </TabsContent>

          <TabsContent value="bills" className="space-y-8 animate-fade-in">
            <BillsTab 
              bills={bills} 
              roommates={roommates} 
              onAddBill={() => setShowBillForm(true)}
              onMarkBillSettled={markBillSettled}
            />
          </TabsContent>

          <TabsContent value="chores" className="space-y-8 animate-fade-in">
            <ChoresTab 
              chores={chores} 
              roommates={roommates} 
              onAddChore={() => setShowChoreForm(true)}
              onToggleChore={toggleChoreComplete}
            />
          </TabsContent>

          <TabsContent value="shopping" className="space-y-8 animate-fade-in">
            <ShoppingListTab 
              items={shoppingItems}
              roommates={roommates}
              onAddItem={() => setShowShoppingForm(true)}
              onMarkPurchased={markShoppingItemPurchased}
              onRemoveItem={removeShoppingItem}
            />
          </TabsContent>

          <TabsContent value="roommates" className="space-y-8 animate-fade-in">
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
              <div className="mt-8 animate-scale-in">
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

        {/* Modal Forms */}
        {showBillForm && (
          <div className="animate-fade-in">
            <BillForm
              roommates={roommates}
              onSubmit={(bill) => {
                setBills([...bills, { ...bill, id: Date.now().toString() }]);
                setShowBillForm(false);
              }}
              onClose={() => setShowBillForm(false)}
            />
          </div>
        )}

        {showChoreForm && (
          <div className="animate-fade-in">
            <ChoreForm
              roommates={roommates}
              onSubmit={(chore) => {
                setChores([...chores, { ...chore, id: Date.now().toString(), completed: false }]);
                setShowChoreForm(false);
              }}
              onClose={() => setShowChoreForm(false)}
            />
          </div>
        )}

        {showGroupForm && (
          <div className="animate-fade-in">
            <GroupForm
              onSubmit={(groupName) => {
                createGroup(groupName);
                setShowGroupForm(false);
              }}
              onClose={() => setShowGroupForm(false)}
            />
          </div>
        )}

        {showShoppingForm && (
          <div className="animate-fade-in">
            <ShoppingItemForm
              onSubmit={(item) => {
                setShoppingItems([...shoppingItems, { ...item, id: Date.now().toString() }]);
                setShowShoppingForm(false);
              }}
              onClose={() => setShowShoppingForm(false)}
              currentUserId={roommates[0]?.id || '1'}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
