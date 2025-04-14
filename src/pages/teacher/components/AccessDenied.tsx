
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface AccessDeniedProps {
  message?: string;
  linkTo?: string;
  linkText?: string;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ 
  message = "You don't have permission to view this page.", 
  linkTo = "/dashboard", 
  linkText = "Back to Dashboard" 
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-96">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
      <p className="text-gray-600 mb-6">{message}</p>
      <Link to={linkTo}>
        <Button>{linkText}</Button>
      </Link>
    </div>
  );
};

export default AccessDenied;
