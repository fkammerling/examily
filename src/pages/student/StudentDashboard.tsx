
import React from 'react';
import { useExams } from '../../context/ExamContext';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { BookOpen, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { exams, studentAttempts } = useExams();
  
  // Filter active exams
  const activeExams = exams.filter(exam => exam.isActive);
  
  // Get the student's attempts
  const userAttempts = studentAttempts.filter(attempt => attempt.studentId === user?.id);
  
  // For each exam, check if the student has already attempted it
  const examStatus = activeExams.map(exam => {
    const attempts = userAttempts.filter(attempt => attempt.examId === exam.id);
    const hasSubmitted = attempts.some(attempt => attempt.submittedAt);
    
    return {
      exam,
      hasAttempted: attempts.length > 0,
      hasSubmitted,
      lastAttemptId: attempts.length > 0 ? attempts[attempts.length - 1].id : null
    };
  });
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Student Dashboard</h1>
        <p className="text-gray-600 mt-1">View available exams and check your results</p>
      </div>
      
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Exams</h2>
      
      {examStatus.length === 0 ? (
        <Card className="bg-gray-50 border border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-600">No Exams Available</h3>
            <p className="text-gray-500 text-center max-w-md mt-2">
              There are currently no active exams available. Check back later or contact your teacher.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {examStatus.map(({ exam, hasAttempted, hasSubmitted, lastAttemptId }) => (
            <Card key={exam.id} className="exam-card overflow-hidden border border-gray-200 bg-white">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-bold text-gray-800">{exam.title}</CardTitle>
                  {hasSubmitted ? (
                    <Badge className="bg-blue-500">Completed</Badge>
                  ) : hasAttempted ? (
                    <Badge variant="outline" className="border-yellow-400 text-yellow-700">In Progress</Badge>
                  ) : (
                    <Badge className="bg-green-500">Available</Badge>
                  )}
                </div>
                <CardDescription className="text-gray-600">
                  {exam.description?.slice(0, 100)}{exam.description?.length > 100 ? '...' : ''}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
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
              
              <CardFooter className="pt-4">
                {hasSubmitted ? (
                  <Link to={`/results/${lastAttemptId}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      View Results
                    </Button>
                  </Link>
                ) : hasAttempted ? (
                  <Link to={`/exams/take/${exam.id}?attempt=${lastAttemptId}`} className="w-full">
                    <Button variant="outline" className="w-full border-yellow-400 text-yellow-700 hover:bg-yellow-50">
                      Continue Exam
                    </Button>
                  </Link>
                ) : (
                  <Link to={`/exams/take/${exam.id}`} className="w-full">
                    <Button className="w-full">
                      Start Exam
                    </Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Results</h2>
      
      {userAttempts.filter(attempt => attempt.submittedAt).length === 0 ? (
        <Card className="bg-gray-50 border border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="h-10 w-10 text-gray-400 mb-3" />
            <h3 className="text-md font-medium text-gray-600">No Completed Exams Yet</h3>
            <p className="text-gray-500 text-center max-w-md mt-1">
              Once you complete an exam, your results will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userAttempts
            .filter(attempt => attempt.submittedAt)
            .map(attempt => {
              const exam = exams.find(e => e.id === attempt.examId);
              if (!exam) return null;
              
              return (
                <Card key={attempt.id} className="border border-gray-200 bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-gray-800">{exam.title}</CardTitle>
                    <CardDescription className="text-gray-600">
                      Completed on {attempt.submittedAt && format(new Date(attempt.submittedAt), 'MMM d, yyyy')}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    {attempt.score !== undefined && (
                      <div className="mt-2 mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Score:</span>
                          <span className="text-lg font-bold text-green-600">{Math.round(attempt.score * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-green-600 h-2.5 rounded-full" 
                            style={{ width: `${Math.round(attempt.score * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter>
                    <Link to={`/results/${attempt.id}`} className="w-full">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
