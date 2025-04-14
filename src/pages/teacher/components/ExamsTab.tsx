
import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Edit, Eye, Loader2 } from 'lucide-react';
import { Exam } from '@/types';

interface ExamsTabProps {
  classId: string;
  classExams: Exam[];
  loading: boolean;
  students: any[];
}

const ExamsTab: React.FC<ExamsTabProps> = ({ 
  classId, 
  classExams, 
  loading,
  students 
}) => {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Class Exams ({classExams.length})
        </h2>
        
        <Link to={`/exams/create?classId=${classId}`}>
          <Button size="sm">
            <BookOpen className="h-4 w-4 mr-2" />
            Create New Exam
          </Button>
        </Link>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-lime-600" />
        </div>
      ) : classExams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classExams.map(exam => (
            <Card key={exam.id} className="exam-card overflow-hidden border border-gray-200 bg-white">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-800 mb-1">{exam.title}</CardTitle>
                    <CardDescription className="text-gray-600">
                      {format(new Date(exam.createdAt), 'MMM d, yyyy')}
                    </CardDescription>
                  </div>
                  <Badge variant={exam.isActive ? "default" : "outline"} className={exam.isActive ? "bg-lime-500" : ""}>
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
                    <BookOpen className="h-4 w-4 mr-1 text-lime-600" />
                    <span>{exam.questions.length} Questions</span>
                  </div>
                  
                  {exam.timeLimit && (
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1 text-lime-600" />
                      <span>{students.length} Students</span>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="pt-4 flex justify-end">
                <div className="flex gap-2">
                  <Link to={`/exams/edit/${exam.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  
                  <Link to={`/exams/view/${exam.id}`}>
                    <Button variant="default" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-white border-dashed border-2 border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">No Exams Created Yet</h3>
            <p className="text-gray-500 text-center max-w-md mb-6">
              Create exams for this class to get started. Students will be able to take the exams once they're active.
            </p>
            <Link to={`/exams/create?classId=${classId}`}>
              <Button>
                <BookOpen className="h-5 w-5 mr-2" />
                Create Your First Exam
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default ExamsTab;
