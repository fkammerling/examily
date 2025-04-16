import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');

  const handleSave = () => {
    // TODO: Implement profile update logic (API call)
    setEditMode(false);
  };

  if (!user) {
    return <div className="p-8">You must be logged in to view your profile.</div>;
  }

  return (
    <div className="flex justify-center py-12">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>View and edit your profile information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            {editMode ? (
              <Input value={name} onChange={e => setName(e.target.value)} />
            ) : (
              <div className="text-base text-gray-900">{user.name}</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="text-base text-gray-900">{email}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <div className="text-base text-gray-900 capitalize">{user.role}</div>
          </div>
          <div className="flex gap-4 pt-4">
            {editMode ? (
              <>
                <Button type="button" onClick={handleSave}>
                  Save
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditMode(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button type="button" onClick={() => setEditMode(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
