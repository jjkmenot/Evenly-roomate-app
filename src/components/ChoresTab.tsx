
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, CheckCircle } from 'lucide-react';

interface Roommate {
  id: string;
  name: string;
  email: string;
  color: string;
}

interface Chore {
  id: string;
  title: string;
  assignedTo: string;
  dueDate: string;
  completed: boolean;
  completedDate?: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

interface ChoresTabProps {
  chores: Chore[];
  roommates: Roommate[];
  onAddChore: () => void;
  onToggleChore: (choreId: string) => void;
}

export const ChoresTab: React.FC<ChoresTabProps> = ({ chores, roommates, onAddChore, onToggleChore }) => {
  const getRoommateName = (id: string) => {
    return roommates.find(r => r.id === id)?.name || 'Unknown';
  };

  const getRoommateColor = (id: string) => {
    return roommates.find(r => r.id === id)?.color || 'bg-gray-500';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Household Chores</CardTitle>
          <Button onClick={onAddChore} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Chore
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {chores.map((chore) => {
            const isOverdue = !chore.completed && chore.dueDate < new Date().toISOString().split('T')[0];
            
            return (
              <div key={chore.id} className={`p-4 rounded-lg border ${chore.completed ? 'bg-green-50/50' : isOverdue ? 'bg-red-50/50' : 'bg-white/50'}`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <button
                        onClick={() => onToggleChore(chore.id)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          chore.completed 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : 'border-gray-300 hover:border-green-500'
                        }`}
                      >
                        {chore.completed && <CheckCircle className="h-3 w-3" />}
                      </button>
                      <h3 className={`font-semibold ${chore.completed ? 'line-through text-gray-500' : ''}`}>
                        {chore.title}
                      </h3>
                      <Badge className={getPriorityColor(chore.priority)}>
                        {chore.priority}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-2">{chore.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Assigned to: {getRoommateName(chore.assignedTo)}</span>
                      <span>Due: {chore.dueDate}</span>
                      {chore.completed && chore.completedDate && (
                        <span>Completed: {chore.completedDate}</span>
                      )}
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getRoommateColor(chore.assignedTo)}`}></div>
                </div>
                
                {isOverdue && (
                  <Badge variant="destructive" className="text-xs">
                    Overdue
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
