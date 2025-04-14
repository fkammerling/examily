
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Edit, Save, Copy, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ClassDetails {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  created_by: string;
}

interface ClassHeaderProps {
  classDetails: ClassDetails | null;
  classId: string;
  setClassDetails: React.Dispatch<React.SetStateAction<ClassDetails | null>>;
}

const ClassHeader: React.FC<ClassHeaderProps> = ({ 
  classDetails, 
  classId, 
  setClassDetails 
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedName, setEditedName] = useState(classDetails?.name || '');
  const [editedDescription, setEditedDescription] = useState(classDetails?.description || '');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpdateClass = async () => {
    if (!editedName.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a class name',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      
      const { error } = await supabase
        .from('classes')
        .update({
          name: editedName.trim(),
          description: editedDescription.trim() || null
        })
        .eq('id', classId);
      
      if (error) throw error;
      
      toast({
        title: 'Class Updated',
        description: 'Class information has been updated successfully'
      });
      
      setClassDetails({
        ...classDetails!,
        name: editedName.trim(),
        description: editedDescription.trim() || null
      });
      
      setIsEditDialogOpen(false);
    } catch (error: any) {
      console.error('Error updating class:', error);
      toast({
        title: 'Error',
        description: 'Failed to update class information',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/join-class/${classId}`;
    navigator.clipboard.writeText(inviteLink);
    
    toast({
      title: 'Link Copied',
      description: 'Class invitation link has been copied to clipboard'
    });
  };

  return (
    <div className="mb-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/classes')}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Classes
      </Button>
      
      {classDetails && (
        <div className="flex flex-col md:flex-row justify-between md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{classDetails.name}</h1>
            {classDetails.description && (
              <p className="text-gray-600 mt-1 max-w-2xl">
                {classDetails.description}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Created on {format(new Date(classDetails.created_at), 'MMM d, yyyy')}
            </p>
          </div>
          
          <div className="flex gap-2 mt-4 md:mt-0">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Class
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Class</DialogTitle>
                  <DialogDescription>
                    Update the class information
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-class-name">Class Name</Label>
                    <Input 
                      id="edit-class-name" 
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-class-description">Description (Optional)</Label>
                    <Textarea
                      id="edit-class-description"
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUpdateClass}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" onClick={copyInviteLink}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Invite Link
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassHeader;
