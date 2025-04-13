
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Exam, Question, StudentExamAttempt, User } from '../types';
import { useAuth } from './AuthContext';
import { toast } from '../hooks/use-toast';

type ExamContextType = {
  exams: Exam[];
  loading: boolean;
  createExam: (exam: Omit<Exam, 'id' | 'createdBy' | 'createdAt'>) => void;
  updateExam: (exam: Exam) => void;
  deleteExam: (examId: string) => void;
  toggleExamActive: (examId: string) => void;
  getExam: (examId: string) => Exam | undefined;
  studentAttempts: StudentExamAttempt[];
  startExam: (examId: string) => StudentExamAttempt;
  submitExam: (attempt: StudentExamAttempt) => void;
  getAttempt: (attemptId: string) => StudentExamAttempt | undefined;
};

const ExamContext = createContext<ExamContextType>({
  exams: [],
  loading: false,
  createExam: () => {},
  updateExam: () => {},
  deleteExam: () => {},
  toggleExamActive: () => {},
  getExam: () => undefined,
  studentAttempts: [],
  startExam: () => ({ id: '', examId: '', studentId: '', answers: [], startedAt: new Date() }),
  submitExam: () => {},
  getAttempt: () => undefined,
});

const EXAMS_STORAGE_KEY = 'examhub-exams';
const ATTEMPTS_STORAGE_KEY = 'examhub-attempts';

export const useExams = () => useContext(ExamContext);

export const ExamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [studentAttempts, setStudentAttempts] = useState<StudentExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  // Load exams from localStorage on component mount
  useEffect(() => {
    const storedExams = localStorage.getItem(EXAMS_STORAGE_KEY);
    if (storedExams) {
      try {
        const parsedExams = JSON.parse(storedExams);
        // Convert string dates back to Date objects
        const examsWithDates = parsedExams.map((exam: any) => ({
          ...exam,
          createdAt: new Date(exam.createdAt)
        }));
        setExams(examsWithDates);
      } catch (error) {
        console.error('Failed to parse stored exams:', error);
      }
    }
    
    const storedAttempts = localStorage.getItem(ATTEMPTS_STORAGE_KEY);
    if (storedAttempts) {
      try {
        const parsedAttempts = JSON.parse(storedAttempts);
        // Convert string dates back to Date objects
        const attemptsWithDates = parsedAttempts.map((attempt: any) => ({
          ...attempt,
          startedAt: new Date(attempt.startedAt),
          submittedAt: attempt.submittedAt ? new Date(attempt.submittedAt) : undefined
        }));
        setStudentAttempts(attemptsWithDates);
      } catch (error) {
        console.error('Failed to parse stored attempts:', error);
      }
    }
    
    setLoading(false);
  }, []);

  // Save exams to localStorage whenever they change
  useEffect(() => {
    if (exams.length > 0) {
      localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(exams));
    }
  }, [exams]);

  // Save student attempts to localStorage whenever they change
  useEffect(() => {
    if (studentAttempts.length > 0) {
      localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(studentAttempts));
    }
  }, [studentAttempts]);

  const createExam = (examData: Omit<Exam, 'id' | 'createdBy' | 'createdAt'>) => {
    if (!user) return;
    
    const newExam: Exam = {
      ...examData,
      id: Math.random().toString(36).substring(2, 10),
      createdBy: user.id,
      createdAt: new Date()
    };
    
    setExams(prev => [...prev, newExam]);
    toast({
      title: "Exam created!",
      description: `The exam "${newExam.title}" has been created.`,
    });
  };

  const updateExam = (updatedExam: Exam) => {
    setExams(prev => 
      prev.map(exam => exam.id === updatedExam.id ? updatedExam : exam)
    );
    toast({
      title: "Exam updated!",
      description: `The exam "${updatedExam.title}" has been updated.`,
    });
  };

  const deleteExam = (examId: string) => {
    setExams(prev => prev.filter(exam => exam.id !== examId));
    toast({
      title: "Exam deleted",
      description: "The exam has been permanently deleted.",
    });
  };

  const toggleExamActive = (examId: string) => {
    setExams(prev => 
      prev.map(exam => 
        exam.id === examId 
          ? { ...exam, isActive: !exam.isActive } 
          : exam
      )
    );
  };

  const getExam = (examId: string) => {
    return exams.find(exam => exam.id === examId);
  };

  const startExam = (examId: string) => {
    if (!user) throw new Error('User must be logged in to start an exam');
    
    const newAttempt: StudentExamAttempt = {
      id: Math.random().toString(36).substring(2, 10),
      examId,
      studentId: user.id,
      answers: [],
      startedAt: new Date()
    };
    
    setStudentAttempts(prev => [...prev, newAttempt]);
    return newAttempt;
  };

  const submitExam = (attempt: StudentExamAttempt) => {
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
    
    const updatedAttempt: StudentExamAttempt = {
      ...attempt,
      submittedAt: new Date(),
      score: Math.round((score / totalPoints) * 100) / 100 // Convert to percentage with 2 decimal places
    };
    
    setStudentAttempts(prev => 
      prev.map(a => a.id === attempt.id ? updatedAttempt : a)
    );
    
    toast({
      title: "Exam submitted!",
      description: "Your answers have been recorded successfully.",
    });
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
    }}>
      {children}
    </ExamContext.Provider>
  );
};
