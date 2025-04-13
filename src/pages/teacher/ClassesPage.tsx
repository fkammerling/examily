
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PlusCircle, Users, UserPlus, ScrollText, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Class {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  student_count?: number;
}

const ClassesPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<string | null>(null);
  
  const [newClassName, setNewClassName] = useState('');
  const [newClassDescription, setNewClassDescription] = useState('');
  
  useEffect(() => {
    fetchClasses();
  }, [user]);
  
  const fetchClasses = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch classes created by the current teacher
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .eq('created_by', user.id);
      
      if (classesError) throw classesError;
      
      // Get student count for each class
      const classesWithCounts = await Promise.all(
        classesData.map(async (cls) => {
          const { count, error: countError } = await supabase
            .from('class_students')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', cls.id);
          
          if (countError) throw countError;
          
          return {
            ...cls,
            student_count: count || 0
          };
        })
      );
      
      setClasses(classesWithCounts);
    } catch (error: any) {
      console.error('Error fetching classes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load classes',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateClass = async () => {
    if (!newClassName.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a class name',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('classes')
        .insert([
          {
            name: newClassName.trim(),
            description: newClassDescription.trim() || null,
            created_by: user!.id
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Class Created',
        description: `"${newClassName}" has been created successfully`
      });
      
      setClasses([...classes, { ...data, student_count: 0 }]);
      setNewClassName('');
      setNewClassDescription('');
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      console.error('Error creating class:', error);
      toast({
        title: 'Error',
        description: 'Failed to create class',
        variant: 'destructive'
      });
    }
  };
  
  const handleDeleteClass = async (classId: string) => {
    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId);
      
      if (error) throw error;
      
      toast({
        title: 'Class Deleted',
        description: 'The class has been deleted successfully'
      });
      
      setClasses(classes.filter(c => c.id !== classId));
      setClassToDelete(null);
    } catch (error: any) {
      console.error('Error deleting class:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete class',
        variant: 'destructive'
      });
    }
  };
  
  if (user?.role !== 'teacher') {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">You don't have permission to view this page.</p>
        <Link to="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Classes</h1>
          <p className="text-gray-600 mt-1">Manage your classes and students</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              Create New Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Class</DialogTitle>
              <DialogDescription>
                Add a new class for your students
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="class-name">Class Name</Label>
                <Input 
                  id="class-name" 
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="e.g., Math 101, Biology Section A, etc."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="class-description">Description (Optional)</Label>
                <Textarea
                  id="class-description"
                  value={newClassDescription}
                  onChange={(e) => setNewClassDescription(e.target.value)}
                  placeholder="Add details about this class..."
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateClass}>
                Create Class
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow-sm border border-gray-200">
              <CardHeader className="animate-pulse bg-gray-100 h-24" />
              <CardContent className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
              <CardFooter className="animate-pulse">
                <div className="h-9 bg-gray-200 rounded w-full"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : classes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <Card key={cls.id} className="shadow-sm hover:shadow-md transition-shadow border border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">{cls.name}</CardTitle>
                <CardDescription>
                  Created on {format(new Date(cls.created_at), 'MMM d, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cls.description && (
                  <p className="text-gray-700 mb-4 line-clamp-2">
                    {cls.description}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1 text-lime-600" />
                    <span>{cls.student_count} Students</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setClassToDelete(cls.id)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
                <Link to={`/classes/${cls.id}`}>
                  <Button size="sm">
                    Manage Class
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-white border-dashed border-2 border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">No Classes Created Yet</h3>
            <p className="text-gray-500 text-center max-w-md mb-6">
              Start by creating your first class. You'll be able to add students and assign exams to them.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <PlusCircle className="h-5 w-5 mr-2" />
              Create Your First Class
            </Button>
          </CardContent>
        </Card>
      )}
      
      <AlertDialog open={classToDelete !== null} onOpenChange={(open) => !open && setClassToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Class</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this class? This action cannot be undone
              and all student enrollments for this class will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => classToDelete && handleDeleteClass(classToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClassesPage;
