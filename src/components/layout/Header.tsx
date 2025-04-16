
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen } from 'lucide-react';
import TeacherNav from './TeacherNav';
import ProfileNav from '../navigation/ProfileNav';

const Header: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-green-600" />
              <span className="text-xl font-semibold text-green-800">
                Examily
              </span>
            </Link>
            {user?.role === 'teacher' && <TeacherNav />}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <ProfileNav />
            ) : (
              <Link
                to="/login"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
