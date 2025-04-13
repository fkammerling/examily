
import React from 'react';
import { useAuth } from '../context/AuthContext';
import TeacherDashboard from './teacher/TeacherDashboard';
import StudentDashboard from './student/StudentDashboard';
import { Loader2 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }
  
  if (!user) {
    return null; // This should not happen due to protected routes, but just in case
  }
  
  return (
    <div>
      {user.role === 'teacher' ? (
        <TeacherDashboard />
      ) : (
        <StudentDashboard />
      )}
    </div>
  );
};

export default Dashboard;
