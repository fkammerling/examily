import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client'; // Import supabase instance

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileType, setProfileType] = useState<'bachelor' | 'master' | ''>(user?.profileType || '');
  const [schoolClass, setSchoolClass] = useState(user?.schoolClass || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save profile changes to Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          name,
          email,
          profileType,
          schoolClass
        })
        .eq('id', user?.id);
      if (error) throw error;
      setEditMode(false);
    } catch (err) {
      alert('Failed to save profile.');
    } finally {
      setSaving(false);
    }
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
            {editMode ? (
              <Input value={email} onChange={e => setEmail(e.target.value)} />
            ) : (
              <div className="text-base text-gray-900">{user.email}</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Type</label>
            {editMode ? (
              <select
                className="w-full border rounded-md px-3 py-2"
                value={profileType}
                onChange={e => setProfileType(e.target.value as 'bachelor' | 'master' | '')}
              >
                <option value="">Select...</option>
                <option value="bachelor">Bachelor</option>
                <option value="master">Master</option>
              </select>
            ) : (
              <div className="text-base text-gray-900 capitalize">{user.profileType || '-'}</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">School Class</label>
            {editMode ? (
              <Input value={schoolClass} onChange={e => setSchoolClass(e.target.value)} />
            ) : (
              <div className="text-base text-gray-900">{user.schoolClass || '-'}</div>
            )}
          </div>
          <div className="flex gap-4 pt-4">
            {editMode ? (
              <>
                <Button type="button" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
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
            <Button type="button" variant="secondary" onClick={() => window.location.href = '/'}>
              Return to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
