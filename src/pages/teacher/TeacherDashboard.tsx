
import React, { useState } from 'react';
import { useExams } from '../../context/ExamContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { PlusCircle, BookOpen, Clock, AlertCircle, Edit, Trash2, Eye, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
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
import { Badge } from '@/components/ui/badge';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const { exams, deleteExam, toggleExamActive } = useExams();
  const [examToDelete, setExamToDelete] = useState<string | null>(null);
  
  // Filter exams created by the current teacher
  const teacherExams = exams.filter(exam => exam.createdBy === user?.id);
  
  const handleDeleteExam = (examId: string) => {
    deleteExam(examId);
    setExamToDelete(null);
  };
  
  const handleToggleActive = (examId: string) => {
    toggleExamActive(examId);
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your exams and review student submissions</p>
        </div>
        
        <Link to="/exams/create">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Create New Exam
          </Button>
        </Link>
      </div>
      
      {teacherExams.length === 0 ? (
        <Card className="bg-white border-dashed border-2 border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">No Exams Created Yet</h3>
            <p className="text-gray-500 text-center max-w-md mb-6">
              Start by creating your first exam. You'll be able to add questions, set time limits, and share it with your students.
            </p>
            <Link to="/exams/create">
              <Button>
                <PlusCircle className="h-5 w-5 mr-2" />
                Create Your First Exam
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teacherExams.map(exam => (
            <Card key={exam.id} className="exam-card overflow-hidden border border-gray-200 bg-white">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-800 mb-1">{exam.title}</CardTitle>
                    <CardDescription className="text-gray-600">
                      {format(new Date(exam.createdAt), 'MMM d, yyyy')}
                    </CardDescription>
                  </div>
                  <Badge variant={exam.isActive ? "default" : "outline"} className={exam.isActive ? "bg-green-500" : ""}>
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
                    <BookOpen className="h-4 w-4 mr-1 text-green-600" />
                    <span>{exam.questions.length} Questions</span>
                  </div>
                  
                  {exam.timeLimit && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-green-600" />
                      <span>{exam.timeLimit} Minutes</span>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="pt-4 flex justify-between">
                <div className="flex gap-2">
                  <Link to={`/exams/edit/${exam.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => setExamToDelete(exam.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Link to={`/exams/view/${exam.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                  </Link>
                  
                  <Button
                    variant={exam.isActive ? "outline" : "default"}
                    size="sm"
                    className={exam.isActive ? "text-red-600 border-red-200 hover:bg-red-50" : ""}
                    onClick={() => handleToggleActive(exam.id)}
                  >
                    {exam.isActive ? (
                      <>
                        <X className="h-4 w-4 mr-1" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Activate
                      </>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <AlertDialog open={examToDelete !== null} onOpenChange={(open) => !open && setExamToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exam</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this exam? This action cannot be undone
              and all student submissions for this exam will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => examToDelete && handleDeleteExam(examToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TeacherDashboard;
