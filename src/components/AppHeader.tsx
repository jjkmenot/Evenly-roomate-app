
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut } from 'lucide-react';

export const AppHeader: React.FC = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="flex justify-between items-center mb-8">
      <div className="text-center flex-1">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">RoomieTracker</h1>
        <p className="text-lg text-gray-600">Manage bills, chores, and roommate responsibilities with ease</p>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
              {user?.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-600">{user?.email}</span>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSignOut}
          className="flex items-center space-x-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </Button>
      </div>
    </header>
  );
};
