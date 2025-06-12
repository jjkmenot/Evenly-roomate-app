
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Megaphone, Users, Edit, Trash2, Clock } from 'lucide-react';
import { useAnnouncements, Announcement } from '@/hooks/useAnnouncements';
import { AnnouncementForm } from '@/components/AnnouncementForm';
import { Group } from '@/hooks/useRoommates';
import { useAuth } from '@/contexts/AuthContext';

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

interface AnnouncementsSectionProps {
  roommates: Roommate[];
  groups: Group[];
}

export const AnnouncementsSection: React.FC<AnnouncementsSectionProps> = ({ roommates, groups }) => {
  const { user } = useAuth();
  const { announcements, isLoading, createAnnouncement, updateAnnouncement, deleteAnnouncement, isCreatingAnnouncement } = useAnnouncements();
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  const getRoommateName = (userId: string) => {
    return roommates.find(r => r.user_id === userId)?.name || 'Unknown User';
  };

  const getGroupName = (groupId: string | null) => {
    if (!groupId) return 'All Roommates';
    const group = groups.find(g => g.id === groupId);
    return group?.name || 'Unknown Group';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDueDate = (dueDateString: string) => {
    const dueDate = new Date(dueDateString);
    const now = new Date();
    const diffHours = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `Expires in ${diffHours}h`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `Expires in ${diffDays}d`;
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setShowAnnouncementForm(true);
  };

  const handleDelete = (announcementId: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      deleteAnnouncement(announcementId);
    }
  };

  const handleFormSubmit = (announcementData: { title: string; content: string; groupId?: string; dueDate?: string }) => {
    if (editingAnnouncement) {
      updateAnnouncement({
        id: editingAnnouncement.id,
        updates: {
          title: announcementData.title,
          content: announcementData.content,
          group_id: announcementData.groupId === 'all' ? null : (announcementData.groupId || null),
          due_date: announcementData.dueDate || null,
        }
      });
    } else {
      createAnnouncement(announcementData);
    }
    setShowAnnouncementForm(false);
    setEditingAnnouncement(null);
  };

  const handleFormClose = () => {
    setShowAnnouncementForm(false);
    setEditingAnnouncement(null);
  };

  if (isLoading) {
    return (
      <Card className="bg-orange-50/70 backdrop-blur-sm border-orange-200 shadow-lg">
        <CardContent className="p-6">
          <div className="text-center">Loading announcements...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-orange-50/70 backdrop-blur-sm border-orange-200 shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Megaphone className="h-5 w-5" />
              Announcements
            </CardTitle>
            <Button 
              onClick={() => setShowAnnouncementForm(true)} 
              className="bg-orange-600 hover:bg-orange-700"
              disabled={isCreatingAnnouncement}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Announcement
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {announcements.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No announcements yet!</p>
              <p className="text-sm text-gray-500">Create announcements to keep your roommates informed about important updates.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.slice(0, 5).map((announcement) => (
                <div key={announcement.id} className="p-4 rounded-lg border bg-white/70">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{announcement.title}</h3>
                    <div className="flex items-center gap-2">
                      {announcement.due_date && (
                        <Badge variant="outline" className="text-xs bg-yellow-50">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDueDate(announcement.due_date)}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        {getGroupName(announcement.group_id)}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatDate(announcement.created_at)}
                      </span>
                      {user?.id === announcement.created_by && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(announcement)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(announcement.id)}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm mb-2">{announcement.content}</p>
                  <p className="text-xs text-gray-500">
                    By {getRoommateName(announcement.created_by)}
                  </p>
                </div>
              ))}
              {announcements.length > 5 && (
                <div className="text-center">
                  <Button variant="outline" size="sm">
                    View All Announcements
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {showAnnouncementForm && (
        <AnnouncementForm
          groups={groups}
          announcement={editingAnnouncement || undefined}
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
        />
      )}
    </>
  );
};
