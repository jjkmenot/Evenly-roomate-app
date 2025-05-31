
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
  user_id: string;
}

export const useRoommates = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: roommates = [], isLoading, error } = useQuery({
    queryKey: ['roommates'],
    queryFn: async () => {
      console.log('Fetching roommates...');
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

  const addRoommateMutation = useMutation({
    mutationFn: async (newRoommate: { name: string; email: string }) => {
      const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500', 'bg-pink-500'];
      const selectedColor = colors[roommates.length % colors.length];

      const { data, error } = await supabase
        .from('roommates')
        .insert([{
          user_id: user?.id,
          name: newRoommate.name,
          email: newRoommate.email,
          color: selectedColor,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roommates'] });
      toast({
        title: "Success",
        description: "Roommate added successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error adding roommate:', error);
      toast({
        title: "Error",
        description: "Failed to add roommate",
        variant: "destructive",
      });
    },
  });

  const removeRoommateMutation = useMutation({
    mutationFn: async (roommateId: string) => {
      const { error } = await supabase
        .from('roommates')
        .delete()
        .eq('id', roommateId);

      if (error) throw error;
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
