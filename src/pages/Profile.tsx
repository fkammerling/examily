
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';
import { useToast } from '../hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [studyProgram, setStudyProgram] = useState(user?.study_program || '');
  const [schoolClass, setSchoolClass] = useState(user?.schoolClass || '');
  const [office, setOffice] = useState(user?.office || '');
  const [title, setTitle] = useState(user?.title || '');
  const [subjects, setSubjects] = useState(
    Array.isArray(user?.subjects) ? user.subjects.join(', ') : ''
  );
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name,
          study_program: studyProgram,
          schoolClass,
          office,
          title,
          subjects: subjects.split(',').map(s => s.trim()),
        })
        .eq('id', user?.id);

      if (error) throw error;
      
      setEditMode(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (err) {
      toast({
        title: "Failed to save profile",
        description: "An error occurred while saving your profile.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  React.useEffect(() => {
    if (user?.id) {
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            setName(data.name || '');
            setEmail(user.email || '');
            setStudyProgram(data.study_program || '');
            setSchoolClass(data.schoolClass || '');
            setOffice(data.office || '');
            setTitle(data.title || '');
            setSubjects(Array.isArray(data.subjects) ? data.subjects.join(', ') : '');
          }
        });
    }
  }, [user]);

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
          <div className="space-y-2">
            <Label>Name</Label>
            {editMode ? (
              <Input value={name} onChange={e => setName(e.target.value)} />
            ) : (
              <div className="text-base text-gray-900">{name || '-'}</div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Email</Label>
            <div className="text-base text-gray-900">{email}</div>
          </div>

          {user.role === 'student' ? (
            <>
              <div className="space-y-2">
                <Label>Study Program</Label>
                {editMode ? (
                  <Input 
                    value={studyProgram} 
                    onChange={e => setStudyProgram(e.target.value)}
                    placeholder="e.g., Computer Science"
                  />
                ) : (
                  <div className="text-base text-gray-900">{studyProgram || '-'}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label>School Class</Label>
                {editMode ? (
                  <Input 
                    value={schoolClass} 
                    onChange={e => setSchoolClass(e.target.value)}
                    placeholder="e.g., CS101"
                  />
                ) : (
                  <div className="text-base text-gray-900">{schoolClass || '-'}</div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Office</Label>
                {editMode ? (
                  <Input 
                    value={office} 
                    onChange={e => setOffice(e.target.value)}
                    placeholder="e.g., Room 302"
                  />
                ) : (
                  <div className="text-base text-gray-900">{office || '-'}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Title</Label>
                {editMode ? (
                  <Input 
                    value={title} 
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g., Professor"
                  />
                ) : (
                  <div className="text-base text-gray-900">{title || '-'}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Subjects (comma-separated)</Label>
                {editMode ? (
                  <Textarea 
                    value={subjects} 
                    onChange={e => setSubjects(e.target.value)}
                    placeholder="e.g., Mathematics, Physics, Computer Science"
                  />
                ) : (
                  <div className="text-base text-gray-900">{subjects || '-'}</div>
                )}
              </div>
            </>
          )}

          <div className="flex gap-4 pt-4">
            {editMode ? (
              <>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditMode(true)}>
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
