
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface NotFoundProps {
  message?: string;
  linkTo?: string;
  linkText?: string;
}

const NotFound: React.FC<NotFoundProps> = ({ 
  message = "The resource you're looking for doesn't exist or you don't have permission to view it.", 
  linkTo = "/classes", 
  linkText = "Back to Classes" 
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-96">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Not Found</h1>
      <p className="text-gray-600 mb-6">{message}</p>
      <Link to={linkTo}>
        <Button>{linkText}</Button>
      </Link>
    </div>
  );
};

export default NotFound;
