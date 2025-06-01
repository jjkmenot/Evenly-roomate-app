
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
}

export const useRoommates = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: roommates = [], isLoading, error } = useQuery({
    queryKey: ['roommates'],
    queryFn: async () => {
      console.log('Fetching roommates...');
      console.log('Current user:', user);
      
      const { data, error } = await supabase
        .from('roommates')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching roommates:', error);
        throw error;
      }

      console.log('Roommates fetched:', data);
      return data as Roommate[];
    },
    enabled: !!user,
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

  const addRoommateMutation = useMutation({
    mutationFn: async (newRoommate: { name: string; email: string }) => {
      console.log('Adding new roommate:', newRoommate);
      
      // Check if user with this email already exists
      const { data: existingUser } = await supabase.auth.admin.getUserByEmail(newRoommate.email);
      const isExistingUser = !!existingUser.user;
      
      const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500', 'bg-pink-500'];
      const selectedColor = colors[roommates.length % colors.length];

      const { data, error } = await supabase
        .from('roommates')
        .insert([{
          name: newRoommate.name,
          email: newRoommate.email,
          color: selectedColor,
          status: isExistingUser ? 'registered' : 'invited',
          invited_by: user?.id,
          user_id: isExistingUser ? existingUser.user?.id : null,
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
      if (error.code === '23505') {
        toast({
          title: "Error",
          description: "This person is already a roommate",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add roommate",
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

  return {
    roommates,
    isLoading,
    error,
    addRoommate: addRoommateMutation.mutate,
    removeRoommate: removeRoommateMutation.mutate,
    isAddingRoommate: addRoommateMutation.isPending,
    isRemovingRoommate: removeRoommateMutation.isPending,
  };
};
