
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, CheckSquare, Users, Clock, Shield, Award } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-lime-100 to-white pt-20 pb-32 px-4 sm:px-6 md:pt-32 md:pb-40">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Modern Online Examination Platform
              </h1>
              <p className="text-xl text-gray-700 max-w-2xl">
                Create, manage, and take exams with ease. Perfect for educators who want to 
                assess student knowledge efficiently and securely.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/login">
                  <Button size="lg" className="bg-lime-500 hover:bg-lime-600 text-black">
                    Get Started
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="border-lime-500 text-gray-800">
                    Log In
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-20 h-20 bg-lime-300 rounded-lg transform rotate-6 opacity-50"></div>
                <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-lime-500 rounded-lg transform -rotate-6 opacity-50"></div>
                <div className="relative bg-white p-6 rounded-xl shadow-xl">
                  <img 
                    src="/placeholder.svg" 
                    alt="Exam Platform Screenshot" 
                    className="w-full rounded-lg shadow-sm"
                    width={500}
                    height={300}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Online Exams
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform offers a comprehensive suite of tools for creating, managing, and taking exams online.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<BookOpen className="h-10 w-10 text-lime-500" />}
              title="Multiple Question Types"
              description="Create diverse exams with multiple choice, short answer, and essay questions to test various skills."
            />
            <FeatureCard 
              icon={<CheckSquare className="h-10 w-10 text-lime-500" />}
              title="Automatic Grading"
              description="Save time with automatic grading for objective questions and easy manual grading for essays."
            />
            <FeatureCard 
              icon={<Users className="h-10 w-10 text-lime-500" />}
              title="Class Management"
              description="Organize students into classes and assign exams to specific groups for better management."
            />
            <FeatureCard 
              icon={<Clock className="h-10 w-10 text-lime-500" />}
              title="Timed Exams"
              description="Set time limits for exams to simulate classroom conditions and reduce opportunities for cheating."
            />
            <FeatureCard 
              icon={<Shield className="h-10 w-10 text-lime-500" />}
              title="Secure Testing"
              description="Ensure exam integrity with our secure testing environment and robust authentication."
            />
            <FeatureCard 
              icon={<Award className="h-10 w-10 text-lime-500" />}
              title="Detailed Analytics"
              description="Get insights into student performance with comprehensive reports and statistics."
            />
          </div>
        </div>
      </section>

      {/* For Teachers & Students Section */}
      <section className="py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-16">
            <div className="bg-lime-50 p-8 rounded-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="bg-lime-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </span>
                For Teachers
              </h3>
              <ul className="space-y-4">
                <li className="flex">
                  <span className="text-lime-500 mr-2">✓</span>
                  <span>Create and reuse question banks</span>
                </li>
                <li className="flex">
                  <span className="text-lime-500 mr-2">✓</span>
                  <span>Set up classes and invite students</span>
                </li>
                <li className="flex">
                  <span className="text-lime-500 mr-2">✓</span>
                  <span>Automatic and manual grading options</span>
                </li>
                <li className="flex">
                  <span className="text-lime-500 mr-2">✓</span>
                  <span>Performance analytics and reports</span>
                </li>
                <li className="flex">
                  <span className="text-lime-500 mr-2">✓</span>
                  <span>Export results to various formats</span>
                </li>
              </ul>
              <div className="mt-8">
                <Link to="/login">
                  <Button className="bg-lime-500 hover:bg-lime-600 text-black">
                    Sign Up as Teacher
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="bg-gray-200 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </span>
                For Students
              </h3>
              <ul className="space-y-4">
                <li className="flex">
                  <span className="text-lime-500 mr-2">✓</span>
                  <span>User-friendly exam interface</span>
                </li>
                <li className="flex">
                  <span className="text-lime-500 mr-2">✓</span>
                  <span>Join classes with a simple code</span>
                </li>
                <li className="flex">
                  <span className="text-lime-500 mr-2">✓</span>
                  <span>Take exams from any device</span>
                </li>
                <li className="flex">
                  <span className="text-lime-500 mr-2">✓</span>
                  <span>Get immediate feedback on results</span>
                </li>
                <li className="flex">
                  <span className="text-lime-500 mr-2">✓</span>
                  <span>Review past exams and track progress</span>
                </li>
              </ul>
              <div className="mt-8">
                <Link to="/login">
                  <Button className="bg-gray-200 hover:bg-gray-300 text-gray-800">
                    Sign Up as Student
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-lime-500 py-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Ready to transform your examination process?
          </h2>
          <p className="text-xl text-gray-800 mb-8 max-w-3xl mx-auto">
            Join thousands of educators and students who are making testing easier, 
            more efficient, and more effective.
          </p>
          <Link to="/login">
            <Button size="lg" className="bg-black hover:bg-gray-800 text-white">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold flex items-center">
                <BookOpen className="h-6 w-6 mr-2 text-lime-400" />
                GreenExam Hub
              </h2>
              <p className="mt-2 text-gray-400">© {new Date().getFullYear()} All rights reserved</p>
            </div>
            <div className="flex flex-wrap gap-8">
              <div>
                <h3 className="font-semibold mb-3 text-lime-400">Product</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">Features</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Pricing</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">FAQ</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-lime-400">Company</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">About</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 text-lime-400">Legal</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">Privacy</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Terms</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => {
  return (
    <Card className="border border-gray-200 hover:border-lime-300 transition-all hover:shadow-md">
      <CardContent className="pt-6">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
};

export default LandingPage;
