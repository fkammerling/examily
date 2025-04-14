import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useExams } from '../../context/ExamContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { 
  ArrowLeft, 
  UserPlus, 
  Users, 
  BookOpen, 
  Edit, 
  Trash2, 
  Save, 
  Eye, 
  Check, 
  X, 
  Mail,
  Copy,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Exam } from '@/types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface ClassDetails {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  created_by: string;
}

interface Student {
  id: string;
  email: string;
  name: string | null;
  student_id: string | null;
  grade: string | null;
  joined_at: string;
}

interface ProfileData {
  id: string | null;
  name: string | null;
  student_id: string | null;
  grade: string | null;
  role?: string | null;
}

interface StudentData {
  id: string;
  student_id: string;
  joined_at: string;
  profiles: ProfileData;
}

interface SupabaseUser {
  id: string;
  email: string;
}

const ClassDetails: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const { user } = useAuth();
  const { exams } = useExams();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [classExams, setClassExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students');
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<string | null>(null);
  
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    if (classId && user) {
      fetchClassDetails();
      fetchStudents();
      fetchClassExams();
    }
  }, [classId, user]);
  
  const fetchClassDetails = async () => {
    if (!classId) return;
    
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setClassDetails(data);
        setEditedName(data.name);
        setEditedDescription(data.description || '');
      }
    } catch (error: any) {
      console.error('Error fetching class details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load class details',
        variant: 'destructive'
      });
    }
  };
  
  const fetchStudents = async () => {
    if (!classId) return;
    
    try {
      setLoading(true);
      
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('class_students')
        .select('id, student_id, joined_at')
        .eq('class_id', classId);
      
      if (enrollmentError) throw enrollmentError;
      
      if (!enrollmentData || enrollmentData.length === 0) {
        setStudents([]);
        setLoading(false);
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
    } finally {
      setLoading(false);
    }
  };
  
  const fetchClassExams = async () => {
    if (!classId) return;
    
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('class_id', classId);
      
      if (error) throw error;
      
      const formattedExams = data.map(exam => ({
        id: exam.id,
        title: exam.title,
        description: exam.description || '',
        createdBy: exam.created_by,
        isActive: exam.is_active || false,
        timeLimit: exam.time_limit,
        questions: exam.questions as any[],
        createdAt: new Date(exam.created_at)
      }));
      
      setClassExams(formattedExams);
    } catch (error: any) {
      console.error('Error fetching class exams:', error);
      toast({
        title: 'Error',
        description: 'Failed to load class exams',
        variant: 'destructive'
      });
    }
  };
  
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
  
  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/join-class/${classId}`;
    navigator.clipboard.writeText(inviteLink);
    
    toast({
      title: 'Link Copied',
      description: 'Class invitation link has been copied to clipboard'
    });
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
  
  if (!classDetails && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Class Not Found</h1>
        <p className="text-gray-600 mb-6">The class you're looking for doesn't exist or you don't have permission to view it.</p>
        <Link to="/classes">
          <Button>Back to Classes</Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
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
      
      <Tabs defaultValue="students" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Students
          </TabsTrigger>
          <TabsTrigger value="exams" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Exams
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="students">
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
        </TabsContent>
        
        <TabsContent value="exams">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Class Exams ({classExams.length})
            </h2>
            
            <Link to={`/exams/create?classId=${classId}`}>
              <Button size="sm">
                <BookOpen className="h-4 w-4 mr-2" />
                Create New Exam
              </Button>
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-lime-600" />
            </div>
          ) : classExams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classExams.map(exam => (
                <Card key={exam.id} className="exam-card overflow-hidden border border-gray-200 bg-white">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-800 mb-1">{exam.title}</CardTitle>
                        <CardDescription className="text-gray-600">
                          {format(new Date(exam.createdAt), 'MMM d, yyyy')}
                        </CardDescription>
                      </div>
                      <Badge variant={exam.isActive ? "default" : "outline"} className={exam.isActive ? "bg-lime-500" : ""}>
                        {exam.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-700 mb-4 line-clamp-2 h-12">
                      {exam.description || "No description provided"}
                    </p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-1 text-lime-600" />
                        <span>{exam.questions.length} Questions</span>
                      </div>
                      
                      {exam.timeLimit && (
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1 text-lime-600" />
                          <span>{students.length} Students</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-4 flex justify-end">
                    <div className="flex gap-2">
                      <Link to={`/exams/edit/${exam.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      
                      <Link to={`/exams/view/${exam.id}`}>
                        <Button variant="default" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white border-dashed border-2 border-gray-200">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <BookOpen className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-600 mb-2">No Exams Created Yet</h3>
                <p className="text-gray-500 text-center max-w-md mb-6">
                  Create exams for this class to get started. Students will be able to take the exams once they're active.
                </p>
                <Link to={`/exams/create?classId=${classId}`}>
                  <Button>
                    <BookOpen className="h-5 w-5 mr-2" />
                    Create Your First Exam
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
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
    </div>
  );
};

export default ClassDetails;
