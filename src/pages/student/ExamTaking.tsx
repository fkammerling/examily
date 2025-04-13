import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useExams } from '../../context/ExamContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Question, StudentExamAttempt } from '../../types';
import { 
  AlertTriangle, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  FileQuestion, 
  Loader2 
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '../../hooks/use-toast';

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
import { Progress } from '@/components/ui/progress';

const ExamTaking: React.FC = () => {
  const navigate = useNavigate();
  const { examId } = useParams();
  const [searchParams] = useSearchParams();
  const attemptId = searchParams.get('attempt');
  const { user } = useAuth();
  const { getExam, startExam, submitExam, getAttempt } = useExams();
  const { toast } = useToast();
  
  const [exam, setExam] = useState<ReturnType<typeof getExam>>(undefined);
  const [attempt, setAttempt] = useState<StudentExamAttempt | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; answer: string | string[] }[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showTimeUpDialog, setShowTimeUpDialog] = useState(false);
  
  useEffect(() => {
    if (!examId || !user) {
      navigate('/');
      return;
    }
    
    const examData = getExam(examId);
    if (!examData) {
      toast({
        title: 'Exam Not Found',
        description: 'The exam you were looking for could not be found.',
        variant: 'destructive'
      });
      navigate('/');
      return;
    }
    
    if (!examData.isActive) {
      toast({
        title: 'Exam Not Available',
        description: 'This exam is not currently active.',
        variant: 'destructive'
      });
      navigate('/');
      return;
    }
    
    setExam(examData);
    
    // Check if continuing an existing attempt
    if (attemptId) {
      const existingAttempt = getAttempt(attemptId);
      if (existingAttempt && existingAttempt.studentId === user.id && !existingAttempt.submittedAt) {
        setAttempt(existingAttempt);
        setAnswers(existingAttempt.answers);
        
        // Calculate time left if exam has a time limit
        if (examData.timeLimit) {
          const startTime = new Date(existingAttempt.startedAt).getTime();
          const timeLimit = examData.timeLimit * 60 * 1000; // convert to ms
          const now = Date.now();
          const elapsed = now - startTime;
          const remainingTime = Math.max(0, timeLimit - elapsed);
          
          setTimeLeft(Math.floor(remainingTime / 1000));
        }
      } else {
        // Invalid attempt ID, start a new one
        startExam(examId)
          .then(newAttempt => {
            setAttempt(newAttempt);
            if (examData.timeLimit) {
              setTimeLeft(examData.timeLimit * 60);
            }
          })
          .catch(error => {
            console.error("Error starting exam:", error);
            navigate('/');
          });
      }
    } else {
      // Start a new attempt
      startExam(examId)
        .then(newAttempt => {
          setAttempt(newAttempt);
          if (examData.timeLimit) {
            setTimeLeft(examData.timeLimit * 60);
          }
        })
        .catch(error => {
          console.error("Error starting exam:", error);
          navigate('/');
        });
    }
    
    setLoading(false);
  }, [examId, user, navigate, getExam, toast, startExam, attemptId, getAttempt]);
  
  // Timer effect
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          setShowTimeUpDialog(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft]);
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours > 0 ? hours + 'h ' : ''}${minutes}m ${secs}s`;
  };
  
  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    // Update the answers state
    const existingAnswerIndex = answers.findIndex(a => a.questionId === questionId);
    
    if (existingAnswerIndex >= 0) {
      const updatedAnswers = [...answers];
      updatedAnswers[existingAnswerIndex] = { questionId, answer };
      setAnswers(updatedAnswers);
    } else {
      setAnswers([...answers, { questionId, answer }]);
    }
  };
  
  const getAnswerForQuestion = (questionId: string) => {
    const answer = answers.find(a => a.questionId === questionId);
    return answer ? answer.answer : '';
  };
  
  const handleNextQuestion = () => {
    if (!exam) return;
    setCurrentQuestion(Math.min(currentQuestion + 1, exam.questions.length - 1));
  };
  
  const handlePrevQuestion = () => {
    setCurrentQuestion(Math.max(currentQuestion - 1, 0));
  };
  
  const handleSubmit = () => {
    if (!attempt || !exam) return;
    
    const updatedAttempt: StudentExamAttempt = {
      ...attempt,
      answers
    };
    
    submitExam(updatedAttempt);
    navigate('/');
    
    toast({
      title: 'Exam Submitted',
      description: 'Your exam has been submitted successfully!'
    });
  };
  
  if (loading || !exam || !attempt) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }
  
  const currentQ = exam.questions[currentQuestion];
  const progress = Math.round((answers.length / exam.questions.length) * 100);
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">{exam.title}</h1>
          <p className="text-gray-600 text-sm">
            Started: {format(new Date(attempt.startedAt), 'MMM d, yyyy - h:mm a')}
          </p>
        </div>
        
        {timeLeft !== null && (
          <div className={`mt-4 md:mt-0 flex items-center ${timeLeft < 300 ? 'text-red-600' : 'text-gray-700'}`}>
            <Clock className="h-5 w-5 mr-2" />
            <span className="font-medium">Time left: {formatTime(timeLeft)}</span>
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{answers.length} of {exam.questions.length} questions answered</span>
          <span>{progress}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      <Card className="mb-6 border border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">
              Question {currentQuestion + 1} of {exam.questions.length}
            </CardTitle>
            <div className="text-sm text-gray-600">
              {currentQ.points} {currentQ.points === 1 ? 'point' : 'points'}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-lg font-medium">{currentQ.question}</div>
          
          {currentQ.type === 'multiple_choice' && currentQ.options && (
            <RadioGroup
              value={getAnswerForQuestion(currentQ.id) as string}
              onValueChange={(value) => handleAnswerChange(currentQ.id, value)}
              className="space-y-3"
            >
              {currentQ.options.map((option, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <RadioGroupItem id={`option-${i}`} value={option} />
                  <Label htmlFor={`option-${i}`} className="cursor-pointer">{option}</Label>
                </div>
              ))}
            </RadioGroup>
          )}
          
          {currentQ.type === 'short_answer' && (
            <div className="space-y-2">
              <Label htmlFor="short-answer">Your Answer</Label>
              <Input
                id="short-answer"
                value={getAnswerForQuestion(currentQ.id) as string}
                onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                placeholder="Type your answer here..."
              />
            </div>
          )}
          
          {currentQ.type === 'long_answer' && (
            <div className="space-y-2">
              <Label htmlFor="long-answer">Your Answer</Label>
              <Textarea
                id="long-answer"
                value={getAnswerForQuestion(currentQ.id) as string}
                onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                placeholder="Type your detailed answer here..."
                className="min-h-[200px]"
              />
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={handlePrevQuestion}
            disabled={currentQuestion === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          {currentQuestion < exam.questions.length - 1 ? (
            <Button onClick={handleNextQuestion}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={() => setShowSubmitDialog(true)} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Submit Exam
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <div className="grid grid-cols-6 md:grid-cols-10 gap-2 mb-8">
        {exam.questions.map((q, i) => {
          const hasAnswer = answers.some(a => a.questionId === q.id && a.answer !== '');
          
          return (
            <Button
              key={q.id}
              variant={i === currentQuestion ? "default" : hasAnswer ? "outline" : "secondary"}
              className={`
                h-10 p-0 ${hasAnswer ? "border-green-400 bg-green-50 text-green-800" : ""}
                ${i === currentQuestion ? "bg-green-600 text-white" : ""}
              `}
              onClick={() => setCurrentQuestion(i)}
            >
              {i + 1}
            </Button>
          );
        })}
      </div>
      
      <div className="flex justify-end mb-16">
        <Button onClick={() => setShowSubmitDialog(true)} className="bg-green-600 hover:bg-green-700">
          <CheckCircle className="h-4 w-4 mr-2" />
          Submit Exam
        </Button>
      </div>
      
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Exam</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit this exam? You won't be able to change your answers after submission.
              {answers.length < exam.questions.length && (
                <div className="flex items-center mt-3 text-amber-600 bg-amber-50 p-3 rounded-md">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span>
                    You have answered {answers.length} out of {exam.questions.length} questions.
                    Unanswered questions will be marked as incorrect.
                  </span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>
              Submit Exam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={showTimeUpDialog} onOpenChange={setShowTimeUpDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Time's Up!</AlertDialogTitle>
            <AlertDialogDescription>
              The time limit for this exam has expired. Your answers will be automatically submitted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleSubmit}>
              Submit Exam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExamTaking;
