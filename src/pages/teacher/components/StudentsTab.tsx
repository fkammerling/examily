
import React, { useState } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { UserPlus, Trash2, Loader2, Mail, Users } from 'lucide-react';

interface Student {
  id: string;
  email: string;
  name: string | null;
  student_id: string | null;
  grade: string | null;
  joined_at: string;
}

interface StudentsTabProps {
  classId: string;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  loading: boolean;
}

const StudentsTab: React.FC<StudentsTabProps> = ({ 
  classId, 
  students, 
  setStudents, 
  loading 
}) => {
  const { toast } = useToast();
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<string | null>(null);
  const [studentEmail, setStudentEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddStudent = async () => {
    if (!studentEmail.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a student email',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      
      const { data: userData, error: userError } = await supabase.auth
        .signInWithOtp({
          email: studentEmail.trim(),
          options: {
            shouldCreateUser: false
          }
        });
      
      if (userError) {
        if (userError.message.includes("Email not confirmed")) {
          toast({
            title: 'User Not Found',
            description: 'No user was found with this email address',
            variant: 'destructive'
          });
        } else {
          throw userError;
        }
        setIsProcessing(false);
        return;
      }
      
      if (!userData || !userData.user) {
        toast({
          title: 'User Not Found',
          description: 'No user was found with this email address',
          variant: 'destructive'
        });
        setIsProcessing(false);
        return;
      }
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', userData.user.id)
        .single();
      
      if (profileError) {
        toast({
          title: 'User Not Found',
          description: 'No user was found with this email address',
          variant: 'destructive'
        });
        setIsProcessing(false);
        return;
      }
      
      if (!profileData || typeof profileData !== 'object' || 
          !profileData.hasOwnProperty('id') || !profileData.hasOwnProperty('role')) {
        toast({
          title: 'Profile Error',
          description: 'Could not retrieve user profile data',
          variant: 'destructive'
        });
        setIsProcessing(false);
        return;
      }
      
      const profileId = profileData.id as string;
      const profileRole = profileData.role as string | null;
      
      if (profileRole !== 'student') {
        toast({
          title: 'Not a Student',
          description: 'This user is not registered as a student',
          variant: 'destructive'
        });
        setIsProcessing(false);
        return;
      }
      
      const { data: existingData, error: existingError } = await supabase
        .from('class_students')
        .select('id')
        .eq('class_id', classId)
        .eq('student_id', profileId);
      
      if (existingError) throw existingError;
      
      if (existingData && existingData.length > 0) {
        toast({
          title: 'Already Enrolled',
          description: 'This student is already enrolled in this class',
          variant: 'destructive'
        });
        setIsProcessing(false);
        return;
      }
      
      const { error: insertError } = await supabase
        .from('class_students')
        .insert([
          {
            class_id: classId,
            student_id: profileId
          }
        ]);
      
      if (insertError) throw insertError;
      
      toast({
        title: 'Student Added',
        description: 'Student has been added to the class successfully'
      });
      
      // Fetch updated student list
      fetchStudents();
      setStudentEmail('');
      setIsAddStudentDialogOpen(false);
    } catch (error: any) {
      console.error('Error adding student:', error);
      toast({
        title: 'Error',
        description: 'Failed to add student to class',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchStudents = async () => {
    if (!classId) return;
    
    try {
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('class_students')
        .select('id, student_id, joined_at')
        .eq('class_id', classId);
      
      if (enrollmentError) throw enrollmentError;
      
      if (!enrollmentData || enrollmentData.length === 0) {
        setStudents([]);
        return;
      }
      
      const studentIds = enrollmentData.map(item => item.student_id);
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, student_id, grade')
        .in('id', studentIds);
      
      if (profilesError) throw profilesError;
      
      const formattedStudents = enrollmentData.map(enrollment => {
        const profile = profilesData?.find(p => p.id === enrollment.student_id) || null;
        
        return {
          id: enrollment.student_id,
          email: enrollment.student_id ? `${enrollment.student_id.substring(0, 8)}...@example.com` : 'Unknown',
          name: profile?.name || null,
          student_id: profile?.student_id || null,
          grade: profile?.grade || null,
          joined_at: enrollment.joined_at
        };
      });
      
      setStudents(formattedStudents);
    } catch (error: any) {
      console.error('Error fetching students:', error);
      toast({
        title: 'Error',
        description: 'Failed to load students',
        variant: 'destructive'
      });
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    try {
      const { error } = await supabase
        .from('class_students')
        .delete()
        .eq('class_id', classId)
        .eq('student_id', studentId);
      
      if (error) throw error;
      
      toast({
        title: 'Student Removed',
        description: 'Student has been removed from the class successfully'
      });
      
      setStudents(students.filter(s => s.id !== studentId));
      setStudentToRemove(null);
    } catch (error: any) {
      console.error('Error removing student:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove student from class',
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Students ({students.length})
        </h2>
        
        <Dialog open={isAddStudentDialogOpen} onOpenChange={setIsAddStudentDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Student to Class</DialogTitle>
              <DialogDescription>
                Enter the email address of a registered student
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="student-email">Student Email</Label>
                <Input 
                  id="student-email" 
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="student@example.com"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsAddStudentDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddStudent}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Student'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-lime-600" />
        </div>
      ) : students.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Grade/Year</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name || 'N/A'}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      {student.email}
                    </TableCell>
                    <TableCell>{student.student_id || 'N/A'}</TableCell>
                    <TableCell>{student.grade || 'N/A'}</TableCell>
                    <TableCell>{format(new Date(student.joined_at), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setStudentToRemove(student.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white border-dashed border-2 border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">No Students Yet</h3>
            <p className="text-gray-500 text-center max-w-md mb-6">
              Add students to your class to get started. Students need to be registered in the system first.
            </p>
            <Button onClick={() => setIsAddStudentDialogOpen(true)}>
              <UserPlus className="h-5 w-5 mr-2" />
              Add Your First Student
            </Button>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={studentToRemove !== null} onOpenChange={(open) => !open && setStudentToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this student from the class? 
              This won't delete the student's account, but they will lose access to this class and its exams.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => studentToRemove && handleRemoveStudent(studentToRemove)}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default StudentsTab;
