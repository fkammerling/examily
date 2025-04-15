
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, CheckSquare, Clock, Shield } from 'lucide-react';

const Landing: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: BookOpen,
      title: "Smart Exam Creation",
      description: "Create and customize exams with multiple question types including multiple choice, short answer, and essays."
    },
    {
      icon: Users,
      title: "Class Management",
      description: "Organize students into classes and manage their progress effectively."
    },
    {
      icon: CheckSquare,
      title: "Automated Grading",
      description: "Automatic grading for multiple choice and short answer questions saves time."
    },
    {
      icon: Clock,
      title: "Timed Assessments",
      description: "Set time limits for exams to simulate real testing conditions."
    },
    {
      icon: Shield,
      title: "Secure Testing",
      description: "Secure exam environment with anti-cheating measures."
    }
  ];

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-green-600" />
              <span className="text-xl font-semibold text-green-800">Examily</span>
            </div>
            <Link to={user ? "/" : "/login"}>
              <Button>{user ? "Dashboard" : "Login"}</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-green-50 to-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-6">
              Modern Exam Management Platform
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Streamline your exam creation, administration, and grading process with our comprehensive solution.
            </p>
            <Link to="/login">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Get Started
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
              Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <div key={feature.title} className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <feature.icon className="h-12 w-12 text-green-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-green-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Examily. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
