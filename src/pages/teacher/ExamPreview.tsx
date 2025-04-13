
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useExams } from '../../context/ExamContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Exam } from '../../types';
import { ArrowLeft, CheckCircle, Clock, Edit, FileQuestion } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '../../hooks/use-toast';

const ExamPreview: React.FC = () => {
  const navigate = useNavigate();
  const { examId } = useParams();
  const { getExam, toggleExamActive } = useExams();
  const { toast } = useToast();
  
  const [exam, setExam] = useState<Exam | null>(null);
  
  useEffect(() => {
    if (!examId) {
      navigate('/');
      return;
    }
    
    const examData = getExam(examId);
    if (!examData) {
      toast({
        title: 'Exam Not Found',
        description: 'The exam you were trying to view could not be found.',
        variant: 'destructive'
      });
      navigate('/');
      return;
    }
    
    setExam(examData);
  }, [examId, navigate, getExam, toast]);
  
  if (!exam) {
    return null;
  }
  
  const handleToggleActive = () => {
    toggleExamActive(exam.id);
    setExam({
      ...exam,
      isActive: !exam.isActive
    });
    
    toast({
      title: exam.isActive ? 'Exam Deactivated' : 'Exam Activated',
      description: `The exam has been ${exam.isActive ? 'deactivated' : 'activated'} successfully.`
    });
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/')} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">Exam Preview</h1>
      </div>
      
      <Card className="mb-8 border border-gray-200">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{exam.title}</CardTitle>
              <p className="text-gray-600 mt-1">{exam.description}</p>
            </div>
            <Badge variant={exam.isActive ? "default" : "outline"} className={exam.isActive ? "bg-green-500" : ""}>
              {exam.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
            <div className="flex items-center">
              <FileQuestion className="h-4 w-4 mr-1 text-green-600" />
              <span>{exam.questions.length} Questions</span>
            </div>
            
            {exam.timeLimit && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1 text-green-600" />
                <span>{exam.timeLimit} Minutes</span>
              </div>
            )}
            
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
              <span>{exam.questions.reduce((acc, q) => acc + q.points, 0)} Total Points</span>
            </div>
          </div>
          
          <div className="flex gap-3 mb-6">
            <Button variant="outline" onClick={() => navigate(`/exams/edit/${exam.id}`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Exam
            </Button>
            
            <Button 
              variant={exam.isActive ? "outline" : "default"}
              className={exam.isActive ? "text-red-600 border-red-200 hover:bg-red-50" : ""}
              onClick={handleToggleActive}
            >
              {exam.isActive ? "Deactivate Exam" : "Activate Exam"}
            </Button>
          </div>
          
          <Separator />
          
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Exam Questions</h2>
            
            {exam.questions.map((question, index) => (
              <div key={question.id} className="mb-6 last:mb-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">Question {index + 1}: {question.question}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {question.points} {question.points === 1 ? 'point' : 'points'} · {question.type.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                
                {question.type === 'multiple_choice' && question.options && (
                  <div className="ml-0 mt-3 space-y-2">
                    {question.options.map((option, i) => (
                      <div 
                        key={i} 
                        className={`p-3 rounded-md ${
                          question.correctAnswer === option
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center">
                          {question.correctAnswer === option && (
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          )}
                          <span>
                            {option}
                            {question.correctAnswer === option && " (Correct answer)"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {question.type === 'short_answer' && (
                  <div className="ml-0 mt-3">
                    <div className="text-sm font-medium mb-1">Correct Answer:</div>
                    <div className="p-3 rounded-md bg-green-50 border border-green-200">
                      {question.correctAnswer as string}
                    </div>
                  </div>
                )}
                
                {question.type === 'long_answer' && (
                  <div className="ml-0 mt-3 p-3 rounded-md bg-gray-50 border border-gray-200 text-sm text-gray-600">
                    Students will provide a detailed answer that will need to be manually graded.
                  </div>
                )}
                
                {index < exam.questions.length - 1 && <Separator className="mt-6" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamPreview;
