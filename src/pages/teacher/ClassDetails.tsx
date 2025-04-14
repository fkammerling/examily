
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useExams } from '../../context/ExamContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Exam } from '@/types';

// Import components
import ClassHeader from './components/ClassHeader';
import StudentsTab from './components/StudentsTab';
import ExamsTab from './components/ExamsTab';
import AccessDenied from './components/AccessDenied';
import NotFound from './components/NotFound';

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

const ClassDetails: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const { user } = useAuth();
  const { exams } = useExams();
  const { toast } = useToast();
  
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [classExams, setClassExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students');
  
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
  
  if (user?.role !== 'teacher') {
    return <AccessDenied />;
  }
  
  if (!classDetails && !loading) {
    return <NotFound />;
  }
  
  return (
    <div className="container mx-auto py-8">
      <ClassHeader 
        classDetails={classDetails} 
        classId={classId || ''} 
        setClassDetails={setClassDetails} 
      />
      
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
          <StudentsTab 
            classId={classId || ''} 
            students={students} 
            setStudents={setStudents} 
            loading={loading} 
          />
        </TabsContent>
        
        <TabsContent value="exams">
          <ExamsTab 
            classId={classId || ''} 
            classExams={classExams} 
            loading={loading}
            students={students}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClassDetails;
