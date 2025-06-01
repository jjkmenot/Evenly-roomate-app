
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
  const [hasCheckedCurrentUser, setHasCheckedCurrentUser] = useState(false);

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

  // Check if current user exists as a roommate, if not create one
  useEffect(() => {
    const checkAndCreateCurrentUser = async () => {
      if (!user || !roommates || hasCheckedCurrentUser) return;
      
      console.log('Checking if current user exists as roommate...');
      const userExists = roommates.find(roommate => roommate.user_id === user.id);
      
      if (!userExists) {
        console.log('User not found in roommates, creating...');
        const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500', 'bg-pink-500'];
        const selectedColor = colors[roommates.length % colors.length];

        try {
          const { data, error } = await supabase
            .from('roommates')
            .insert([{
              user_id: user.id,
              name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              email: user.email || '',
              color: selectedColor,
            }])
            .select()
            .single();

          if (error) {
            // Check if it's a duplicate key error (user already exists)
            if (error.code === '23505') {
              console.log('User already exists as roommate, skipping creation');
            } else {
              console.error('Error creating roommate for current user:', error);
              toast({
                title: "Error",
                description: "Failed to create your roommate profile",
                variant: "destructive",
              });
            }
          } else {
            console.log('Created roommate for current user:', data);
            queryClient.invalidateQueries({ queryKey: ['roommates'] });
          }
        } catch (err) {
          console.error('Unexpected error creating roommate:', err);
        }
      } else {
        console.log('Current user found as roommate:', userExists);
      }
      
      setHasCheckedCurrentUser(true);
    };

    checkAndCreateCurrentUser();
  }, [user, roommates, hasCheckedCurrentUser, queryClient, toast]);

  // Reset the check when user changes
  useEffect(() => {
    setHasCheckedCurrentUser(false);
  }, [user?.id]);

  const addRoommateMutation = useMutation({
    mutationFn: async (newRoommate: { name: string; email: string }) => {
      console.log('Adding new roommate:', newRoommate);
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

      if (error) {
        console.error('Error in addRoommateMutation:', error);
        throw error;
      }
      console.log('Successfully added roommate:', data);
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
