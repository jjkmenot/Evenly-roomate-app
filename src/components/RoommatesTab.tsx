import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Group } from '@/hooks/useRoommates';

interface Roommate {
  id: string;
  name: string;
  email: string;
  color: string;
  user_id: string | null;
  status: string | null;
  invited_by: string | null;
  group_id: string | null;
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
  groups: Group[];
  bills: Bill[];
  chores: Chore[];
  onAddRoommate: () => void;
  onCreateGroup: () => void;
  onRemoveRoommate: (roommateId: string) => void;
  onDeleteGroup?: (groupId: string) => void;
}

export const RoommatesTab: React.FC<RoommatesTabProps> = ({ 
  roommates, 
  groups,
  bills, 
  chores, 
  onAddRoommate,
  onCreateGroup,
  onRemoveRoommate,
  onDeleteGroup
}) => {
  const [roommateToRemove, setRoommateToRemove] = useState<Roommate | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);

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

  const handleRemoveClick = (roommate: Roommate) => {
    setRoommateToRemove(roommate);
  };

  const handleConfirmRemove = () => {
    if (roommateToRemove) {
      onRemoveRoommate(roommateToRemove.id);
      setRoommateToRemove(null);
    }
  };

  const handleCancelRemove = () => {
    setRoommateToRemove(null);
  };

  const handleDeleteGroupClick = (group: Group) => {
    setGroupToDelete(group);
  };

  const handleConfirmDeleteGroup = () => {
    if (groupToDelete && onDeleteGroup) {
      onDeleteGroup(groupToDelete.id);
      setGroupToDelete(null);
    }
  };

  const handleCancelDeleteGroup = () => {
    setGroupToDelete(null);
  };

  const getGroupName = (groupId: string | null) => {
    if (!groupId) return 'No Group';
    const group = groups.find(g => g.id === groupId);
    return group?.name || 'Unknown Group';
  };

  // Group roommates by group
  const groupedRoommates = groups.reduce((acc, group) => {
    acc[group.id] = roommates.filter(r => r.group_id === group.id);
    return acc;
  }, {} as Record<string, Roommate[]>);

  // Add ungrouped roommates
  const ungroupedRoommates = roommates.filter(r => !r.group_id);
  if (ungroupedRoommates.length > 0) {
    groupedRoommates['ungrouped'] = ungroupedRoommates;
  }

  return (
    <>
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Roommates & Groups</CardTitle>
            <div className="flex gap-2">
              <Button onClick={onCreateGroup} variant="outline" className="bg-white/50">
                <Users className="h-4 w-4 mr-2" />
                Create Group
              </Button>
              <Button onClick={onAddRoommate} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Roommate
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {roommates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No roommates yet!</p>
              <p className="text-sm text-gray-500">Add roommates to start managing bills and chores together.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedRoommates).map(([groupId, groupRoommates]) => (
                <div key={groupId} className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {groupId === 'ungrouped' ? 'Individual Roommates' : getGroupName(groupId)}
                    </h3>
                    {groupId !== 'ungrouped' && onDeleteGroup && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const group = groups.find(g => g.id === groupId);
                          if (group) handleDeleteGroupClick(group);
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete Group
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupRoommates.map((roommate) => {
                      const balance = getTotalBalance(roommate.id);
                      const roommateChores = chores.filter(chore => chore.assignedTo === roommate.id);
                      const completedChores = roommateChores.filter(chore => chore.completed).length;
                      const isInvited = roommate.status === 'invited';
                      
                      return (
                        <div key={roommate.id} className="p-4 rounded-lg border bg-white/50">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full ${roommate.color} flex items-center justify-center text-white font-bold ${isInvited ? 'opacity-60' : ''}`}>
                                {roommate.name.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className={`font-semibold ${isInvited ? 'text-gray-500' : ''}`}>
                                    {roommate.name}
                                  </h3>
                                  {isInvited && (
                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                      Invited
                                    </span>
                                  )}
                                </div>
                                <p className={`text-sm ${isInvited ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {roommate.email}
                                </p>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleRemoveClick(roommate)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              Remove
                            </Button>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Balance:</span>
                              <span className={`font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'} ${isInvited ? 'opacity-60' : ''}`}>
                                {balance >= 0 ? '+' : ''}${balance.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Chores:</span>
                              <span className={`text-sm font-medium ${isInvited ? 'opacity-60' : ''}`}>
                                {completedChores}/{roommateChores.length} done
                              </span>
                            </div>
                            {isInvited && (
                              <div className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded">
                                Waiting for {roommate.name} to register
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Roommate removal dialog */}
      <AlertDialog open={!!roommateToRemove} onOpenChange={handleCancelRemove}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Roommate</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {roommateToRemove?.name}? This action cannot be undone and will also remove all associated bills and chores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelRemove}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmRemove}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Group deletion dialog */}
      <AlertDialog open={!!groupToDelete} onOpenChange={handleCancelDeleteGroup}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{groupToDelete?.name}"? This will remove all roommates from this group but won't delete the roommates themselves. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDeleteGroup}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDeleteGroup}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Group
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
