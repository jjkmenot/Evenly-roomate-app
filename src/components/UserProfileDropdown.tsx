
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';

export const UserProfileDropdown = () => {
  const { user } = useAuth();

  if (!user) return null;

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-white/30"
        >
          <div className="flex items-center justify-center h-full w-full text-white font-bold text-lg">
            {userInitial}
          </div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/20 to-pink-400/20 animate-pulse"></div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-72 bg-white/95 backdrop-blur-sm border border-white/30 shadow-xl rounded-xl" 
        align="end" 
        forceMount
      >
        <DropdownMenuLabel className="font-normal p-4">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                {userInitial}
              </div>
              <div>
                <p className="text-base font-semibold leading-none text-gray-800">{displayName}</p>
                <p className="text-sm leading-none text-gray-500 mt-1">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
