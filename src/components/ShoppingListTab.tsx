
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Check, X } from 'lucide-react';

interface Roommate {
  id: string;
  name: string;
  email: string;
  color: string;
}

interface ShoppingItem {
  id: string;
  item: string;
  addedBy: string;
  dateAdded: string;
  purchased: boolean;
  purchasedBy?: string;
  purchasedDate?: string;
}

interface ShoppingListTabProps {
  items: ShoppingItem[];
  roommates: Roommate[];
  onAddItem: () => void;
  onMarkPurchased: (itemId: string) => void;
  onRemoveItem: (itemId: string) => void;
}

export const ShoppingListTab: React.FC<ShoppingListTabProps> = ({ 
  items, 
  roommates, 
  onAddItem, 
  onMarkPurchased, 
  onRemoveItem 
}) => {
  const getRoommateName = (id: string) => {
    return roommates.find(r => r.id === id)?.name || 'Unknown';
  };

  const pendingItems = items.filter(item => !item.purchased);
  const purchasedItems = items.filter(item => item.purchased);

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Shopping List - Items Needed</CardTitle>
            <Button onClick={onAddItem} className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingItems.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No items needed right now!</p>
            ) : (
              pendingItems.map((item) => (
                <div key={item.id} className="p-3 rounded-lg border bg-white/50 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{item.item}</h3>
                    <p className="text-sm text-gray-600">
                      Added by {getRoommateName(item.addedBy)} on {item.dateAdded}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => onMarkPurchased(item.id)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Bought
                    </Button>
                    <Button 
                      onClick={() => onRemoveItem(item.id)}
                      size="sm"
                      variant="outline"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {purchasedItems.length > 0 && (
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Recently Purchased</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {purchasedItems.slice(0, 5).map((item) => (
                <div key={item.id} className="p-3 rounded-lg border bg-green-50/50 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium line-through text-gray-600">{item.item}</h3>
                    <p className="text-sm text-gray-500">
                      Purchased by {getRoommateName(item.purchasedBy || '')} on {item.purchasedDate}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Purchased</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
