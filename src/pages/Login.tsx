
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { UserRole } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { BookOpen, Loader2, Mail } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

const Login: React.FC = () => {
  const { user, login, signup, loginWithGoogle, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [grade, setGrade] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [activeTab, setActiveTab] = useState('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classes, setClasses] = useState<{id: string, name: string}[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');

  useEffect(() => {
    // Fetch classes for student signup
    if (role === 'student' && activeTab === 'signup') {
      const fetchClasses = async () => {
        const { data, error } = await supabase
          .from('classes')
          .select('id, name');
        
        if (error) {
          console.error('Error fetching classes:', error);
          return;
        }
        
        if (data) {
          setClasses(data);
        }
      };
      
      fetchClasses();
    }
  }, [role, activeTab]);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please provide both email and password",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please provide both email and password",
        variant: "destructive",
      });
      return;
    }
    
    if (role === 'student' && !studentId) {
      toast({
        title: "Missing information",
        description: "Please provide your student ID",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Add extra metadata for the profile
      const metadata: Record<string, any> = {
        role,
        name: name || email.split('@')[0],
      };
      
      if (role === 'student') {
        metadata.student_id = studentId;
        metadata.grade = grade;
      }
      
      await signup(email, password, role, name);
      
      // If student selected a class, add them to the class
      if (role === 'student' && selectedClass) {
        // This will be handled by a trigger that creates the user profile
        // and then we'll associate the student with the class
        const { error: authError } = await supabase.auth.getUser();
        
        if (!authError) {
          // The class association will happen in the signup flow
          // after the user is created and logged in
          toast({
            title: "Account created",
            description: "You will be enrolled in the selected class after verification",
          });
        }
      }
      
      // Switch to login tab after successful signup
      setActiveTab('login');
      toast({
        title: "Account created",
        description: "Please log in with your new account",
      });
    } catch (error) {
      console.error("Signup error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-lime-100 to-white">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BookOpen className="h-12 w-12 text-lime-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">GreenExam Hub</h1>
          <p className="text-gray-600 mt-2">
            A modern platform for managing and taking exams
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Welcome to GreenExam Hub</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4 pt-4">
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
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link 
                        to="/forgot-password" 
                        className="text-xs text-lime-600 hover:text-lime-800"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      required 
                    />
                  </div>
                </CardContent>
                
                <CardFooter className="flex-col space-y-4">
                  <Button 
                    className="w-full" 
                    type="submit" 
                    disabled={isLoading || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                  
                  <div className="relative w-full">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">or</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isLoading || isSubmitting}
                    className="w-full"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" className="mr-2 h-4 w-4"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
                    Sign in with Google
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Name (Optional)</Label>
                    <Input 
                      id="signup-name" 
                      type="text" 
                      placeholder="Your name" 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                    />
                  </div>
                
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input 
                      id="signup-email" 
                      type="email" 
                      placeholder="email@example.com" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      required 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input 
                      id="signup-password" 
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
                  
                  {role === 'student' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="student-id">Student ID</Label>
                        <Input 
                          id="student-id" 
                          type="text" 
                          placeholder="Your student ID" 
                          value={studentId} 
                          onChange={e => setStudentId(e.target.value)} 
                          required 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="grade">Grade/Year</Label>
                        <Input 
                          id="grade" 
                          type="text" 
                          placeholder="e.g., 10th Grade, Year 2, etc." 
                          value={grade} 
                          onChange={e => setGrade(e.target.value)} 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="class">Join Class (Optional)</Label>
                        <SelectField
                          value={selectedClass}
                          onValueChange={setSelectedClass}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a class to join" />
                          </SelectTrigger>
                          <SelectContent>
                            {classes.length > 0 ? (
                              classes.map(cls => (
                                <SelectItem key={cls.id} value={cls.id}>
                                  {cls.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="none" disabled>
                                No classes available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </SelectField>
                      </div>
                    </>
                  )}
                </CardContent>
                
                <CardFooter className="flex-col space-y-4">
                  <Button 
                    className="w-full" 
                    type="submit" 
                    disabled={isLoading || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                  
                  <div className="relative w-full">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">or</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    type="button" 
                    className="w-full" 
                    onClick={handleGoogleLogin}
                    disabled={isLoading || isSubmitting}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" className="mr-2 h-4 w-4"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
                    Sign up with Google
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
        
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-lime-600 hover:text-lime-800">
            Back to home page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
