
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

interface ShoppingItemFormProps {
  onSubmit: (item: any) => void;
  onClose: () => void;
  currentUserId: string;
}

export const ShoppingItemForm: React.FC<ShoppingItemFormProps> = ({ 
  onSubmit, 
  onClose, 
  currentUserId 
}) => {
  const [item, setItem] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!item.trim()) return;

    onSubmit({
      item: item.trim(),
      addedBy: currentUserId,
      dateAdded: new Date().toISOString().split('T')[0],
      purchased: false,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Add Shopping Item</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="item">Item Needed</Label>
              <Input
                id="item"
                value={item}
                onChange={(e) => setItem(e.target.value)}
                placeholder="e.g., Toilet paper, Dish soap, Paper towels"
                required
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700">
                Add to List
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
