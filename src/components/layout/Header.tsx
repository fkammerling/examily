import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { LogOut, User, BookOpen } from 'lucide-react';
import TeacherNav from './TeacherNav';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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
            {user && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm relative group">
                  <User className="h-4 w-4 text-green-600" />
                  <button
                    className="font-medium text-gray-700 hover:underline focus:outline-none"
                    id="profile-menu-trigger"
                    type="button"
                  >
                    {user.name} ({user.role})
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-150"
                       id="profile-menu"
                       style={{ top: '100%', left: '50%', transform: 'translateX(-50%)', minWidth: '180px' }}>
                    <div className="py-1">
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => navigate('/profile')}>
                        Profile & Details
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={handleLogout}>
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
