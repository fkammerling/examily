
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { BookOpen, Loader2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const Login: React.FC = () => {
  const { user, login, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please provide both email and password",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await login(email, password, role);
      navigate('/');
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BookOpen className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-green-800">Green Exam Hub</h1>
          <p className="text-gray-600 mt-2">
            A modern platform for managing and taking exams
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Sign in as a teacher or student to continue
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="email@example.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                />
              </div>
              
              <div className="pt-2 space-y-2">
                <Label>I am a:</Label>
                <div className="flex gap-4">
                  <Button 
                    type="button"
                    variant={role === 'student' ? 'default' : 'outline'} 
                    className={role === 'student' ? 'w-full' : 'w-full bg-white'}
                    onClick={() => setRole('student')}
                  >
                    Student
                  </Button>
                  <Button 
                    type="button"
                    variant={role === 'teacher' ? 'default' : 'outline'} 
                    className={role === 'teacher' ? 'w-full' : 'w-full bg-white'}
                    onClick={() => setRole('teacher')}
                  >
                    Teacher
                  </Button>
                </div>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>For demo purposes, you can use any email and password.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
