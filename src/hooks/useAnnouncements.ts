
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  created_by: string;
  group_id: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export const useAnnouncements = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: announcements = [], isLoading, error } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      if (!user?.id) {
        return [];
      }

      // Get announcements that are not expired
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          *,
          groups(name)
        `)
        .or('due_date.is.null,due_date.gte.' + new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching announcements:', error);
        throw error;
      }

      return data as Announcement[];
    },
    enabled: !!user?.id,
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: async (newAnnouncement: { title: string; content: string; groupId?: string; dueDate?: string }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      console.log('Creating announcement with user ID:', user.id);
      console.log('Announcement data:', newAnnouncement);

      const announcementData = {
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        created_by: user.id,
        group_id: newAnnouncement.groupId === 'all' ? null : (newAnnouncement.groupId || null),
        due_date: newAnnouncement.dueDate || null,
      };

      console.log('Final announcement data:', announcementData);

      const { data, error } = await supabase
        .from('announcements')
        .insert([announcementData])
        .select()
        .single();

      if (error) {
        console.error('Error creating announcement:', error);
        throw error;
      }

      // Send email notifications in the background
      setTimeout(() => {
        sendAnnouncementEmail(newAnnouncement.title, newAnnouncement.content, newAnnouncement.groupId);
      }, 0);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast({
        title: "Success",
        description: "Announcement created and notifications sent",
      });
    },
    onError: (error: any) => {
      console.error('Error creating announcement:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create announcement",
        variant: "destructive",
      });
    },
  });

  const updateAnnouncementMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Announcement> }) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('announcements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating announcement:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast({
        title: "Success",
        description: "Announcement updated successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error updating announcement:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update announcement",
        variant: "destructive",
      });
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting announcement:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast({
        title: "Success",
        description: "Announcement deleted successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting announcement:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete announcement",
        variant: "destructive",
      });
    },
  });

  const sendAnnouncementEmail = async (title: string, content: string, groupId?: string) => {
    try {
      const response = await supabase.functions.invoke('send-announcement-email', {
        body: {
          title,
          content,
          groupId,
          createdBy: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'A roommate',
        },
      });

      if (response.error) {
        console.error('Error sending announcement email:', response.error);
      } else {
        console.log('Announcement email sent successfully');
      }
    } catch (error) {
      console.error('Error sending announcement email:', error);
    }
  };

  return {
    announcements,
    isLoading,
    error,
    createAnnouncement: createAnnouncementMutation.mutate,
    updateAnnouncement: updateAnnouncementMutation.mutate,
    deleteAnnouncement: deleteAnnouncementMutation.mutate,
    isCreatingAnnouncement: createAnnouncementMutation.isPending,
    isUpdatingAnnouncement: updateAnnouncementMutation.isPending,
    isDeletingAnnouncement: deleteAnnouncementMutation.isPending,
  };
};
