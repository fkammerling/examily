
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useExams } from '../../context/ExamContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Exam, Question, StudentExamAttempt } from '../../types';
import { ArrowLeft, CheckCircle, Clock, FileQuestion, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '../../hooks/use-toast';

const QuestionResult: React.FC<{
  question: Question;
  answer: string | string[] | undefined;
}> = ({ question, answer }) => {
  const isCorrect = () => {
    if (!answer) return false;
    
    if (question.type === 'multiple_choice') {
      if (Array.isArray(question.correctAnswer) && Array.isArray(answer)) {
        return JSON.stringify(question.correctAnswer.sort()) === JSON.stringify(answer.sort());
      } else {
        return question.correctAnswer === answer;
      }
    } else if (question.type === 'short_answer') {
      return question.correctAnswer === answer;
    }
    
    // Long answers are manually graded
    return null;
  };
  
  const correctness = isCorrect();
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-start gap-2">
          <div className="mt-1">
            {correctness === true ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : correctness === false ? (
              <XCircle className="h-5 w-5 text-red-500" />
            ) : (
              <FileQuestion className="h-5 w-5 text-amber-500" />
            )}
          </div>
          <div>
            <p className="font-medium text-lg">{question.question}</p>
            <p className="text-sm text-gray-600 mt-1">
              {question.points} {question.points === 1 ? 'point' : 'points'} · {question.type.replace('_', ' ')}
            </p>
          </div>
        </div>
        
        {correctness !== null && (
          <Badge 
            variant={correctness ? "default" : "outline"}
            className={correctness ? "bg-green-500" : "text-red-600 border-red-200"}
          >
            {correctness ? "Correct" : "Incorrect"}
          </Badge>
        )}
      </div>
      
      {question.type === 'multiple_choice' && question.options && (
        <div className="ml-7 mt-3 space-y-2">
          {question.options.map((option, i) => {
            const isSelected = answer === option;
            const isCorrectOption = question.correctAnswer === option;
            
            return (
              <div 
                key={i} 
                className={`p-3 rounded-md ${
                  isCorrectOption 
                    ? 'bg-green-50 border border-green-200' 
                    : isSelected 
                      ? 'bg-red-50 border border-red-200' 
                      : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-center">
                  {isCorrectOption && <CheckCircle className="h-4 w-4 text-green-600 mr-2" />}
                  {isSelected && !isCorrectOption && <XCircle className="h-4 w-4 text-red-500 mr-2" />}
                  <span>
                    {option}
                    {isCorrectOption && " (Correct answer)"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {(question.type === 'short_answer' || question.type === 'long_answer') && (
        <div className="ml-7 mt-3 space-y-3">
          <div>
            <div className="text-sm font-medium mb-1">Your Answer:</div>
            <div className="p-3 rounded-md bg-gray-50 border border-gray-200">
              {answer || <span className="text-gray-400">No answer provided</span>}
            </div>
          </div>
          
          {question.type === 'short_answer' && (
            <div>
              <div className="text-sm font-medium mb-1">Correct Answer:</div>
              <div className="p-3 rounded-md bg-green-50 border border-green-200">
                {question.correctAnswer as string}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ExamResults: React.FC = () => {
  const navigate = useNavigate();
  const { attemptId } = useParams();
  const { user } = useAuth();
  const { getAttempt, getExam } = useExams();
  const { toast } = useToast();
  
  const [attempt, setAttempt] = useState<StudentExamAttempt | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  
  useEffect(() => {
    if (!attemptId || !user) {
      navigate('/');
      return;
    }
    
    const attemptData = getAttempt(attemptId);
    if (!attemptData || attemptData.studentId !== user.id) {
      toast({
        title: 'Not Found',
        description: 'The exam results you were looking for could not be found.',
        variant: 'destructive'
      });
      navigate('/');
      return;
    }
    
    setAttempt(attemptData);
    
    const examData = getExam(attemptData.examId);
    if (!examData) {
      toast({
        title: 'Exam Not Found',
        description: 'The exam associated with these results could not be found.',
        variant: 'destructive'
      });
      navigate('/');
      return;
    }
    
    setExam(examData);
  }, [attemptId, user, navigate, getAttempt, getExam, toast]);
  
  if (!attempt || !exam) {
    return null;
  }
  
  const duration = attempt.submittedAt 
    ? Math.round((new Date(attempt.submittedAt).getTime() - new Date(attempt.startedAt).getTime()) / 60000) 
    : 0;
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/')} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">Exam Results</h1>
      </div>
      
      <Card className="mb-8 border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">{exam.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Exam Started</h3>
                <p>{format(new Date(attempt.startedAt), 'MMM d, yyyy - h:mm a')}</p>
              </div>
              
              {attempt.submittedAt && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Exam Submitted</h3>
                  <p>{format(new Date(attempt.submittedAt), 'MMM d, yyyy - h:mm a')}</p>
                </div>
              )}
              
              {duration > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Time Taken</h3>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-500 mr-1" />
                    <p>{duration} minutes</p>
                  </div>
                </div>
              )}
            </div>
            
            {attempt.score !== undefined && (
              <div className="flex flex-col justify-center items-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-4xl font-bold text-green-600">{Math.round(attempt.score * 100)}%</div>
                <div className="text-gray-600 mt-1">Final Score</div>
                
                <div className="w-full h-3 bg-gray-200 rounded-full mt-4">
                  <div 
                    className="h-3 bg-green-600 rounded-full" 
                    style={{ width: `${Math.round(attempt.score * 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          
          <Separator />
          
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Answers and Feedback</h2>
            
            {exam.questions.map((question) => {
              const answer = attempt.answers.find(a => a.questionId === question.id)?.answer;
              return (
                <QuestionResult 
                  key={question.id} 
                  question={question} 
                  answer={answer}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamResults;
