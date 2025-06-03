
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRoommates } from '@/hooks/useRoommates';

interface RoommateFormProps {
  onClose: () => void;
}

export const RoommateForm: React.FC<RoommateFormProps> = ({ onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const { addRoommate, groups, isAddingRoommate } = useRoommates();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      addRoommate({ 
        name: name.trim(), 
        email: email.trim(),
        groupId: selectedGroupId || undefined
      });
      setName('');
      setEmail('');
      setSelectedGroupId('');
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter roommate's name"
          required
          disabled={isAddingRoommate}
        />
      </div>
      
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter roommate's email"
          required
          disabled={isAddingRoommate}
        />
      </div>

      <div>
        <Label htmlFor="group">Group (Optional)</Label>
        <Select value={selectedGroupId} onValueChange={setSelectedGroupId} disabled={isAddingRoommate}>
          <SelectTrigger>
            <SelectValue placeholder="Select a group (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no-group">No Group</SelectItem>
            {groups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isAddingRoommate} className="flex-1">
          {isAddingRoommate ? 'Adding...' : 'Add Roommate'}
        </Button>
        <Button type="button" variant="outline" onClick={onClose} disabled={isAddingRoommate}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
