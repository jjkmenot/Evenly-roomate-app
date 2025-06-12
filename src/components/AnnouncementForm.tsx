
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
import { Group } from '@/hooks/useRoommates';
import { Announcement } from '@/hooks/useAnnouncements';

interface AnnouncementFormProps {
  groups: Group[];
  announcement?: Announcement;
  onSubmit: (announcement: { title: string; content: string; groupId?: string; dueDate?: string }) => void;
  onClose: () => void;
}

export const AnnouncementForm: React.FC<AnnouncementFormProps> = ({ groups, announcement, onSubmit, onClose }) => {
  const [title, setTitle] = useState(announcement?.title || '');
  const [content, setContent] = useState(announcement?.content || '');
  const [selectedGroupId, setSelectedGroupId] = useState<string>(announcement?.group_id || '');
  const [dueDate, setDueDate] = useState(
    announcement?.due_date ? new Date(announcement.due_date).toISOString().slice(0, 16) : ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onSubmit({
      title: title.trim(),
      content: content.trim(),
      groupId: selectedGroupId || undefined,
      dueDate: dueDate || undefined,
    });

    if (!announcement) {
      setTitle('');
      setContent('');
      setSelectedGroupId('');
      setDueDate('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{announcement ? 'Edit Announcement' : 'Create Announcement'}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Landlord Inspection Tomorrow"
                required
              />
            </div>

            <div>
              <Label htmlFor="content">Message</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Provide details about the announcement..."
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="group">Group (Optional)</Label>
              <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a group (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roommates</SelectItem>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date (Optional)</Label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="When should this announcement expire?"
              />
              <p className="text-xs text-gray-500 mt-1">
                Announcement will be automatically removed after this date
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700">
                {announcement ? 'Update Announcement' : 'Create Announcement'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
