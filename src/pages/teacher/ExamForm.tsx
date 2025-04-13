
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useExams } from '../../context/ExamContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Trash2, Plus, Save, ArrowLeft, HelpCircle } from 'lucide-react';
import { QuestionType, Question } from '../../types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useToast } from '../../hooks/use-toast';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const QuestionEditor: React.FC<{
  question: Question;
  onChange: (updatedQuestion: Question) => void;
  onDelete: () => void;
  index: number;
}> = ({ question, onChange, onDelete, index }) => {
  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange({ ...question, question: e.target.value });
  };

  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const points = parseInt(e.target.value);
    if (isNaN(points) || points < 0) return;
    onChange({ ...question, points });
  };

  const handleTypeChange = (type: QuestionType) => {
    // Update question type and reset options/correctAnswer if needed
    const updatedQuestion: Question = { 
      ...question, 
      type,
      options: type === 'multiple_choice' ? (question.options || ['', '']) : undefined,
      correctAnswer: type === 'multiple_choice' 
        ? (question.options?.[0] || '') 
        : (type === 'short_answer' ? '' : undefined)
    };
    onChange(updatedQuestion);
  };

  const handleOptionChange = (index: number, value: string) => {
    if (!question.options) return;
    const updatedOptions = [...question.options];
    updatedOptions[index] = value;
    onChange({ ...question, options: updatedOptions });
  };

  const handleAddOption = () => {
    if (!question.options) return;
    onChange({ ...question, options: [...question.options, ''] });
  };

  const handleRemoveOption = (index: number) => {
    if (!question.options || question.options.length <= 2) return;
    const updatedOptions = question.options.filter((_, i) => i !== index);
    
    // If the correct answer was the removed option, reset it
    let updatedCorrectAnswer = question.correctAnswer;
    if (question.correctAnswer === question.options[index]) {
      updatedCorrectAnswer = updatedOptions[0];
    }
    
    onChange({ 
      ...question, 
      options: updatedOptions,
      correctAnswer: updatedCorrectAnswer
    });
  };

  const handleCorrectAnswerChange = (value: string) => {
    onChange({ ...question, correctAnswer: value });
  };

  return (
    <Card className="mb-6 border border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Question {index + 1}</CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onDelete}
            className="text-red-600 hover:text-red-800 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`question-${question.id}`}>Question Text</Label>
          <Textarea
            id={`question-${question.id}`}
            placeholder="Enter your question here..."
            value={question.question}
            onChange={handleQuestionChange}
            className="min-h-[80px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Question Type</Label>
            <Select
              value={question.type}
              onValueChange={(value) => handleTypeChange(value as QuestionType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select question type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                <SelectItem value="short_answer">Short Answer</SelectItem>
                <SelectItem value="long_answer">Long Answer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={`points-${question.id}`}>Points</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-[200px] text-sm">
                      Points determine the weight of this question in the exam's total score.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id={`points-${question.id}`}
              type="number"
              min="1"
              step="1"
              value={question.points}
              onChange={handlePointsChange}
            />
          </div>
        </div>

        {question.type === 'multiple_choice' && question.options && (
          <div className="space-y-3 mt-2">
            <div className="flex items-center justify-between">
              <Label>Answer Options</Label>
              <Button 
                type="button"
                variant="outline" 
                size="sm" 
                onClick={handleAddOption}
                className="text-xs"
              >
                <Plus className="h-3 w-3 mr-1" /> Add Option
              </Button>
            </div>
            
            {question.options.map((option, i) => (
              <div key={i} className="flex gap-2 items-center">
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                  className="flex-1"
                />
                {question.options && question.options.length > 2 && (
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleRemoveOption(i)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 h-9 w-9 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            
            <div className="space-y-2 mt-4">
              <Label>Correct Answer</Label>
              <Select
                value={question.correctAnswer as string || ''}
                onValueChange={handleCorrectAnswerChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select correct answer" />
                </SelectTrigger>
                <SelectContent>
                  {question.options.map((option, i) => (
                    <SelectItem key={i} value={option} disabled={!option.trim()}>
                      {option || `Option ${i + 1} (empty)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {question.type === 'short_answer' && (
          <div className="space-y-2 mt-2">
            <Label htmlFor={`correct-${question.id}`}>Correct Answer</Label>
            <Input
              id={`correct-${question.id}`}
              placeholder="Enter the expected answer..."
              value={question.correctAnswer as string || ''}
              onChange={(e) => handleCorrectAnswerChange(e.target.value)}
            />
          </div>
        )}
        
        {question.type === 'long_answer' && (
          <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm text-gray-600">
            <p>Long answer questions will need to be manually graded after submission.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ExamForm: React.FC = () => {
  const navigate = useNavigate();
  const { examId } = useParams();
  const { getExam, createExam, updateExam } = useExams();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState<number | undefined>(undefined);
  const [isActive, setIsActive] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (examId) {
      const exam = getExam(examId);
      if (exam) {
        setTitle(exam.title);
        setDescription(exam.description);
        setTimeLimit(exam.timeLimit);
        setIsActive(exam.isActive);
        setQuestions(exam.questions);
      } else {
        navigate('/');
        toast({
          title: 'Exam Not Found',
          description: 'The exam you were trying to edit could not be found.',
          variant: 'destructive'
        });
      }
    } else {
      // Initialize with a default question for new exams
      setQuestions([
        {
          id: `q-${Date.now()}`,
          type: 'multiple_choice',
          question: '',
          options: ['', ''],
          correctAnswer: '',
          points: 1
        }
      ]);
    }
  }, [examId, getExam, navigate, toast]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (questions.length === 0) {
      newErrors.questions = 'At least one question is required';
    }
    
    questions.forEach((q, index) => {
      if (!q.question.trim()) {
        newErrors[`question-${index}`] = `Question ${index + 1} text is required`;
      }
      
      if (q.type === 'multiple_choice' && q.options) {
        const validOptions = q.options.filter(o => o.trim());
        if (validOptions.length < 2) {
          newErrors[`options-${index}`] = `Question ${index + 1} must have at least 2 non-empty options`;
        }
        
        if (!q.correctAnswer) {
          newErrors[`correct-${index}`] = `Question ${index + 1} must have a correct answer selected`;
        }
      }
      
      if (q.type === 'short_answer' && !q.correctAnswer) {
        newErrors[`correct-${index}`] = `Question ${index + 1} must have a correct answer specified`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      type: 'multiple_choice',
      question: '',
      options: ['', ''],
      correctAnswer: '',
      points: 1
    };
    
    setQuestions([...questions, newQuestion]);
  };

  const handleQuestionChange = (index: number, updatedQuestion: Question) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = updatedQuestion;
    setQuestions(updatedQuestions);
  };

  const handleQuestionDelete = (index: number) => {
    if (questions.length <= 1) {
      toast({
        title: 'Cannot Delete',
        description: 'An exam must have at least one question.',
        variant: 'destructive'
      });
      return;
    }
    
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form.',
        variant: 'destructive'
      });
      return;
    }
    
    const examData = {
      title,
      description,
      timeLimit,
      isActive,
      questions
    };
    
    if (examId) {
      const exam = getExam(examId);
      if (exam) {
        updateExam({
          ...exam,
          ...examData
        });
        
        toast({
          title: 'Exam Updated',
          description: 'Your exam has been updated successfully.'
        });
      }
    } else {
      createExam(examData);
      toast({
        title: 'Exam Created',
        description: 'Your new exam has been created successfully.'
      });
    }
    
    navigate('/');
  };

  const handleTimeLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setTimeLimit(undefined);
    } else {
      const parsed = parseInt(value);
      if (!isNaN(parsed) && parsed >= 0) {
        setTimeLimit(parsed);
      }
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/')} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">
          {examId ? 'Edit Exam' : 'Create New Exam'}
        </h1>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Card className="mb-8 border border-gray-200">
          <CardHeader>
            <CardTitle>Exam Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Exam Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter exam title..."
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a description of the exam..."
                className="min-h-[100px]"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeLimit">Time Limit (Minutes, Optional)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  min="0"
                  value={timeLimit === undefined ? '' : timeLimit}
                  onChange={handleTimeLimitChange}
                  placeholder="Leave empty for no time limit"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="isActive" className="block mb-1">Exam Status</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    {isActive ? 'Active (Students can take this exam)' : 'Inactive (Hidden from students)'}
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Questions</h2>
          <Button type="button" onClick={handleAddQuestion} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>
        
        {errors.questions && (
          <p className="text-sm text-red-500 mb-4">{errors.questions}</p>
        )}
        
        {questions.map((question, index) => (
          <QuestionEditor
            key={question.id}
            question={question}
            onChange={(updatedQuestion) => handleQuestionChange(index, updatedQuestion)}
            onDelete={() => handleQuestionDelete(index)}
            index={index}
          />
        ))}
        
        <div className="flex justify-end gap-4 mt-8 mb-16">
          <Button type="button" variant="outline" onClick={() => navigate('/')}>
            Cancel
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            {examId ? 'Update Exam' : 'Create Exam'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ExamForm;
