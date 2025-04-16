export type UserRole = 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  profileType?: 'bachelor' | 'master';
  schoolClass?: string;
}

export type QuestionType = 'multiple_choice' | 'short_answer' | 'long_answer';

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  isActive: boolean;
  timeLimit?: number; // in minutes
  questions: Question[];
  createdAt: Date;
}

export interface StudentExamAttempt {
  id: string;
  examId: string;
  studentId: string;
  answers: {
    questionId: string;
    answer: string | string[];
  }[];
  startedAt: Date;
  submittedAt?: Date;
  score?: number;
}
