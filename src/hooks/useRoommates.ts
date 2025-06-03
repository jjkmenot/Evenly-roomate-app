import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Roommate {
  id: string;
  name: string;
  email: string;
  color: string;
  user_id: string | null;
  status: string | null;
  invited_by: string | null;
  group_id: string | null;
}

export interface Group {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useRoommates = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: groups = [], isLoading: isLoadingGroups } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      console.log('Fetching groups...');
      
      if (!user?.id) {
        console.log('No user found, skipping groups fetch');
        return [];
      }

      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching groups:', error);
        throw error;
      }

      console.log('Groups fetched:', data);
      return data as Group[];
    },
    enabled: !!user?.id,
  });

  const { data: roommates = [], isLoading, error } = useQuery({
    queryKey: ['roommates'],
    queryFn: async () => {
      console.log('Fetching roommates...');
      console.log('Current user:', user);
      
      if (!user?.id) {
        console.log('No user found, skipping roommates fetch');
        return [];
      }

      const { data, error } = await supabase
        .from('roommates')
        .select('*')
        .or(`invited_by.eq.${user.id},user_id.eq.${user.id}`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching roommates:', error);
        throw error;
      }

      console.log('Roommates fetched:', data);
      return data as Roommate[];
    },
    enabled: !!user?.id,
  });

  const sendInvitationEmail = async (roommateName: string, roommateEmail: string, isNewUser: boolean) => {
    try {
      const inviterName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Your roommate';
      
      const response = await supabase.functions.invoke('send-roommate-invitation', {
        body: {
          invitedBy: inviterName,
          roommateEmail,
          roommateName,
          isNewUser,
        },
      });

      if (response.error) {
        console.error('Error sending invitation email:', response.error);
        toast({
          title: "Warning",
          description: "Roommate added but failed to send email notification",
          variant: "destructive",
        });
      } else {
        console.log('Invitation email sent successfully');
      }
    } catch (error) {
      console.error('Error sending invitation email:', error);
      toast({
        title: "Warning",
        description: "Roommate added but failed to send email notification",
        variant: "destructive",
      });
    }
  };

  const createGroupMutation = useMutation({
    mutationFn: async (groupName: string) => {
      console.log('Creating new group:', groupName);
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('groups')
        .insert([{
          name: groupName,
          created_by: user.id,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating group:', error);
        throw error;
      }
      
      console.log('Successfully created group:', data);
      return data;
    },
    onSuccess: (newGroup) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast({
        title: "Success",
        description: `Group "${newGroup.name}" created successfully`,
      });
    },
    onError: (error: any) => {
      console.error('Error creating group:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create group",
        variant: "destructive",
      });
    },
  });

  const addRoommateMutation = useMutation({
    mutationFn: async (newRoommate: { name: string; email: string; groupId?: string }) => {
      console.log('Adding new roommate:', newRoommate);
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Check if a roommate with this email already exists
      const { data: existingRoommate } = await supabase
        .from('roommates')
        .select('*')
        .eq('email', newRoommate.email)
        .single();

      if (existingRoommate) {
        throw new Error('This person is already a roommate');
      }

      // Check if user with this email exists in auth.users by trying to find existing profile
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', newRoommate.email)
        .single();

      const isExistingUser = !!existingProfile;
      
      const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500', 'bg-pink-500'];
      const selectedColor = colors[roommates.length % colors.length];

      const { data, error } = await supabase
        .from('roommates')
        .insert([{
          name: newRoommate.name,
          email: newRoommate.email,
          color: selectedColor,
          status: isExistingUser ? 'registered' : 'invited',
          invited_by: user.id,
          user_id: isExistingUser ? existingProfile.id : null,
          group_id: newRoommate.groupId || null,
        }])
        .select()
        .single();

      if (error) {
        console.error('Error in addRoommateMutation:', error);
        throw error;
      }
      
      console.log('Successfully added roommate:', data);
      
      // Send invitation email in the background
      setTimeout(() => {
        sendInvitationEmail(newRoommate.name, newRoommate.email, !isExistingUser);
      }, 0);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roommates'] });
      toast({
        title: "Success",
        description: "Roommate added successfully and invitation email sent",
      });
    },
    onError: (error: any) => {
      console.error('Error adding roommate:', error);
      if (error.message === 'This person is already a roommate') {
        toast({
          title: "Error",
          description: "This person is already a roommate",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to add roommate",
          variant: "destructive",
        });
      }
    },
  });

  const removeRoommateMutation = useMutation({
    mutationFn: async (roommateId: string) => {
      console.log('Removing roommate:', roommateId);
      const { error } = await supabase
        .from('roommates')
        .delete()
        .eq('id', roommateId);

      if (error) {
        console.error('Error in removeRoommateMutation:', error);
        throw error;
      }
      console.log('Successfully removed roommate');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roommates'] });
      toast({
        title: "Success",
        description: "Roommate removed successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error removing roommate:', error);
      toast({
        title: "Error",
        description: "Failed to remove roommate",
        variant: "destructive",
      });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      console.log('Deleting group:', groupId);
      
      // First, update all roommates in this group to have no group
      const { error: roommateError } = await supabase
        .from('roommates')
        .update({ group_id: null })
        .eq('group_id', groupId);

      if (roommateError) {
        console.error('Error updating roommates:', roommateError);
        throw roommateError;
      }

      // Then delete the group
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId);

      if (error) {
        console.error('Error in deleteGroupMutation:', error);
        throw error;
      }
      console.log('Successfully deleted group');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['roommates'] });
      toast({
        title: "Success",
        description: "Group deleted successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting group:', error);
      toast({
        title: "Error",
        description: "Failed to delete group",
        variant: "destructive",
      });
    },
  });

  return {
    roommates,
    groups,
    isLoading: isLoading || isLoadingGroups,
    error,
    addRoommate: addRoommateMutation.mutate,
    removeRoommate: removeRoommateMutation.mutate,
    createGroup: createGroupMutation.mutate,
    deleteGroup: deleteGroupMutation.mutate,
    isAddingRoommate: addRoommateMutation.isPending,
    isRemovingRoommate: removeRoommateMutation.isPending,
    isCreatingGroup: createGroupMutation.isPending,
    isDeletingGroup: deleteGroupMutation.isPending,
  };
};
