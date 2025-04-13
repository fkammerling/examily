
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Exam, Question, StudentExamAttempt, User } from '../types';
import { useAuth } from './AuthContext';
import { toast } from '../hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type ExamContextType = {
  exams: Exam[];
  loading: boolean;
  createExam: (exam: Omit<Exam, 'id' | 'createdBy' | 'createdAt'>) => Promise<void>;
  updateExam: (exam: Exam) => Promise<void>;
  deleteExam: (examId: string) => Promise<void>;
  toggleExamActive: (examId: string) => Promise<void>;
  getExam: (examId: string) => Exam | undefined;
  studentAttempts: StudentExamAttempt[];
  startExam: (examId: string) => Promise<StudentExamAttempt>;
  submitExam: (attempt: StudentExamAttempt) => Promise<void>;
  getAttempt: (attemptId: string) => StudentExamAttempt | undefined;
  refreshExams: () => Promise<void>;
  refreshAttempts: () => Promise<void>;
};

const ExamContext = createContext<ExamContextType>({
  exams: [],
  loading: false,
  createExam: async () => {},
  updateExam: async () => {},
  deleteExam: async () => {},
  toggleExamActive: async () => {},
  getExam: () => undefined,
  studentAttempts: [],
  startExam: async () => ({ id: '', examId: '', studentId: '', answers: [], startedAt: new Date() }),
  submitExam: async () => {},
  getAttempt: () => undefined,
  refreshExams: async () => {},
  refreshAttempts: async () => {},
});

export const useExams = () => useContext(ExamContext);

export const ExamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [studentAttempts, setStudentAttempts] = useState<StudentExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch exams when user authentication state changes
  useEffect(() => {
    if (user && session) {
      refreshExams();
      refreshAttempts();
    } else {
      setExams([]);
      setStudentAttempts([]);
      setLoading(false);
    }
  }, [user, session]);

  const refreshExams = async () => {
    if (!user || !session) return;
    
    setLoading(true);
    try {
      let query;
      
      if (user.role === 'teacher') {
        query = supabase
          .from('exams')
          .select('*')
          .eq('created_by', user.id);
      } else {
        query = supabase
          .from('exams')
          .select('*')
          .eq('is_active', true);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const formattedExams: Exam[] = data.map(exam => ({
          id: exam.id,
          title: exam.title,
          description: exam.description || '',
          createdBy: exam.created_by,
          isActive: exam.is_active,
          timeLimit: exam.time_limit,
          questions: exam.questions,
          createdAt: new Date(exam.created_at)
        }));
        
        setExams(formattedExams);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast({
        title: "Failed to load exams",
        description: "There was an error loading exams. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshAttempts = async () => {
    if (!user || !session) return;
    
    try {
      let query;
      
      if (user.role === 'student') {
        query = supabase
          .from('exam_attempts')
          .select('*, exams(*)')
          .eq('student_id', user.id);
      } else {
        // For teachers, we fetch all attempts for exams they created
        query = supabase
          .from('exam_attempts')
          .select('*, exams!inner(*)')
          .eq('exams.created_by', user.id);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const formattedAttempts: StudentExamAttempt[] = data.map(attempt => ({
          id: attempt.id,
          examId: attempt.exam_id,
          studentId: attempt.student_id,
          answers: attempt.answers || [],
          startedAt: new Date(attempt.started_at),
          submittedAt: attempt.submitted_at ? new Date(attempt.submitted_at) : undefined,
          score: attempt.score
        }));
        
        setStudentAttempts(formattedAttempts);
      }
    } catch (error) {
      console.error('Error fetching attempts:', error);
    }
  };

  const createExam = async (examData: Omit<Exam, 'id' | 'createdBy' | 'createdAt'>) => {
    if (!user || !session) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create an exam.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('exams')
        .insert({
          title: examData.title,
          description: examData.description,
          is_active: examData.isActive,
          time_limit: examData.timeLimit,
          questions: examData.questions,
          created_by: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        const newExam: Exam = {
          id: data.id,
          title: data.title,
          description: data.description || '',
          createdBy: data.created_by,
          isActive: data.is_active,
          timeLimit: data.time_limit,
          questions: data.questions,
          createdAt: new Date(data.created_at)
        };
        
        setExams(prev => [...prev, newExam]);
        
        toast({
          title: "Exam created!",
          description: `The exam "${newExam.title}" has been created.`,
        });
      }
    } catch (error: any) {
      console.error('Error creating exam:', error);
      toast({
        title: "Failed to create exam",
        description: error.message || "There was an error creating the exam.",
        variant: "destructive",
      });
    }
  };

  const updateExam = async (updatedExam: Exam) => {
    if (!user || !session) return;
    
    try {
      const { error } = await supabase
        .from('exams')
        .update({
          title: updatedExam.title,
          description: updatedExam.description,
          is_active: updatedExam.isActive,
          time_limit: updatedExam.timeLimit,
          questions: updatedExam.questions
        })
        .eq('id', updatedExam.id)
        .eq('created_by', user.id);
      
      if (error) throw error;
      
      setExams(prev => 
        prev.map(exam => exam.id === updatedExam.id ? updatedExam : exam)
      );
      
      toast({
        title: "Exam updated!",
        description: `The exam "${updatedExam.title}" has been updated.`,
      });
    } catch (error: any) {
      console.error('Error updating exam:', error);
      toast({
        title: "Failed to update exam",
        description: error.message || "There was an error updating the exam.",
        variant: "destructive",
      });
    }
  };

  const deleteExam = async (examId: string) => {
    if (!user || !session) return;
    
    try {
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', examId)
        .eq('created_by', user.id);
      
      if (error) throw error;
      
      setExams(prev => prev.filter(exam => exam.id !== examId));
      
      toast({
        title: "Exam deleted",
        description: "The exam has been permanently deleted.",
      });
    } catch (error: any) {
      console.error('Error deleting exam:', error);
      toast({
        title: "Failed to delete exam",
        description: error.message || "There was an error deleting the exam.",
        variant: "destructive",
      });
    }
  };

  const toggleExamActive = async (examId: string) => {
    if (!user || !session) return;
    
    const exam = exams.find(e => e.id === examId);
    if (!exam) return;
    
    try {
      const { error } = await supabase
        .from('exams')
        .update({ is_active: !exam.isActive })
        .eq('id', examId)
        .eq('created_by', user.id);
      
      if (error) throw error;
      
      setExams(prev => 
        prev.map(e => 
          e.id === examId 
            ? { ...e, isActive: !e.isActive } 
            : e
        )
      );
      
      toast({
        title: exam.isActive ? "Exam deactivated" : "Exam activated",
        description: `The exam "${exam.title}" has been ${exam.isActive ? "deactivated" : "activated"}.`,
      });
    } catch (error: any) {
      console.error('Error toggling exam status:', error);
      toast({
        title: "Failed to update exam status",
        description: error.message || "There was an error updating the exam status.",
        variant: "destructive",
      });
    }
  };

  const getExam = (examId: string) => {
    return exams.find(exam => exam.id === examId);
  };

  const startExam = async (examId: string) => {
    if (!user || !session) {
      throw new Error('User must be logged in to start an exam');
    }
    
    try {
      // Check if the user already has an attempt for this exam
      const existingAttempt = studentAttempts.find(
        attempt => attempt.examId === examId && attempt.studentId === user.id && !attempt.submittedAt
      );
      
      if (existingAttempt) {
        return existingAttempt;
      }
      
      // Create a new attempt
      const { data, error } = await supabase
        .from('exam_attempts')
        .insert({
          exam_id: examId,
          student_id: user.id,
          answers: []
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const newAttempt: StudentExamAttempt = {
        id: data.id,
        examId: data.exam_id,
        studentId: data.student_id,
        answers: data.answers || [],
        startedAt: new Date(data.started_at)
      };
      
      setStudentAttempts(prev => [...prev, newAttempt]);
      return newAttempt;
    } catch (error: any) {
      console.error('Error starting exam:', error);
      toast({
        title: "Failed to start exam",
        description: error.message || "There was an error starting the exam.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const submitExam = async (attempt: StudentExamAttempt) => {
    if (!user || !session) return;
    
    const exam = getExam(attempt.examId);
    if (!exam) return;
    
    // Calculate score for multiple choice and short answers
    let score = 0;
    let totalPoints = 0;
    
    exam.questions.forEach(question => {
      totalPoints += question.points;
      
      const studentAnswer = attempt.answers.find(a => a.questionId === question.id);
      if (!studentAnswer) return;
      
      if (question.type === 'multiple_choice') {
        if (Array.isArray(question.correctAnswer) && 
            Array.isArray(studentAnswer.answer) && 
            JSON.stringify(question.correctAnswer.sort()) === JSON.stringify(studentAnswer.answer.sort())) {
          score += question.points;
        } else if (!Array.isArray(question.correctAnswer) && 
                  !Array.isArray(studentAnswer.answer) && 
                  question.correctAnswer === studentAnswer.answer) {
          score += question.points;
        }
      } else if (question.type === 'short_answer' && 
                question.correctAnswer === studentAnswer.answer) {
        score += question.points;
      }
      // Long answers need to be graded manually
    });
    
    const calculatedScore = totalPoints > 0 ? Math.round((score / totalPoints) * 100) / 100 : 0;
    
    try {
      const { error } = await supabase
        .from('exam_attempts')
        .update({
          answers: attempt.answers,
          submitted_at: new Date().toISOString(),
          score: calculatedScore
        })
        .eq('id', attempt.id)
        .eq('student_id', user.id);
      
      if (error) throw error;
      
      const updatedAttempt: StudentExamAttempt = {
        ...attempt,
        submittedAt: new Date(),
        score: calculatedScore
      };
      
      setStudentAttempts(prev => 
        prev.map(a => a.id === attempt.id ? updatedAttempt : a)
      );
      
      toast({
        title: "Exam submitted!",
        description: "Your answers have been recorded successfully.",
      });
    } catch (error: any) {
      console.error('Error submitting exam:', error);
      toast({
        title: "Failed to submit exam",
        description: error.message || "There was an error submitting your exam.",
        variant: "destructive",
      });
    }
  };

  const getAttempt = (attemptId: string) => {
    return studentAttempts.find(attempt => attempt.id === attemptId);
  };

  return (
    <ExamContext.Provider value={{
      exams,
      loading,
      createExam,
      updateExam,
      deleteExam,
      toggleExamActive,
      getExam,
      studentAttempts,
      startExam,
      submitExam,
      getAttempt,
      refreshExams,
      refreshAttempts,
    }}>
      {children}
    </ExamContext.Provider>
  );
};
