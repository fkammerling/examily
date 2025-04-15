
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import { Loader2 } from 'lucide-react';

const AppLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect to dashboard if user tries to access the root path
  React.useEffect(() => {
    if (user && location.pathname === '/') {
      navigate('/dashboard');
    }
  }, [user, location.pathname, navigate]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#abfb6b]" />
        <p className="mt-4 text-lg text-gray-800">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="py-4 bg-[#abfb6b] text-black text-center">
        <p className="text-sm">© {new Date().getFullYear()} GreenExam Hub</p>
      </footer>
    </div>
  );
};

export default AppLayout;
