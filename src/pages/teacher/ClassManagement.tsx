import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const ClassManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Class Management</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add New Class
        </Button>
      </div>
      
      <div className="rounded-md border">
        <div className="p-4">
          {/* Placeholder for class list */}
          <p className="text-muted-foreground">No classes created yet.</p>
        </div>
      </div>
    </div>
  );
};

export default ClassManagement;
