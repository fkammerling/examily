
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, CheckCircle, Users, Award, BookText, FileSpreadsheet } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-4 px-6 bg-white shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-[#abfb6b]" />
            <h1 className="text-2xl font-bold">GreenExam Hub</h1>
          </div>
          <div className="flex gap-4">
            <Link to="/login">
              <Button variant="outline">Log in</Button>
            </Link>
            <Link to="/login?tab=signup">
              <Button className="bg-[#abfb6b] text-black hover:bg-[#9dea5d]">Sign up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#e4ffcc] to-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Modern Online Examination Platform</h1>
          <p className="text-xl text-gray-700 mb-10 max-w-3xl mx-auto">
            Create, manage, and take exams with ease. Designed for teachers and students 
            to make the examination process smooth and efficient.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/login?tab=signup&role=teacher">
              <Button className="bg-[#abfb6b] text-black hover:bg-[#9dea5d] h-12 px-8 text-lg">
                Join as Teacher
              </Button>
            </Link>
            <Link to="/login?tab=signup&role=student">
              <Button variant="outline" className="h-12 px-8 text-lg">
                Join as Student
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="rounded-full w-12 h-12 flex items-center justify-center bg-[#e4ffcc] mb-4">
                <BookText className="h-6 w-6 text-[#6bbb2b]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Flexible Exam Creation</h3>
              <p className="text-gray-600">
                Create various types of questions including multiple choice, short answer, and essays 
                with rich formatting options.
              </p>
            </div>
            
            <div className="p-6 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="rounded-full w-12 h-12 flex items-center justify-center bg-[#e4ffcc] mb-4">
                <Users className="h-6 w-6 text-[#6bbb2b]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Class Management</h3>
              <p className="text-gray-600">
                Organize students into classes, track performance, and assign exams to specific groups or individuals.
              </p>
            </div>
            
            <div className="p-6 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="rounded-full w-12 h-12 flex items-center justify-center bg-[#e4ffcc] mb-4">
                <Award className="h-6 w-6 text-[#6bbb2b]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Instant Grading</h3>
              <p className="text-gray-600">
                Automatic grading for objective questions with detailed feedback and analytics.
              </p>
            </div>
            
            <div className="p-6 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="rounded-full w-12 h-12 flex items-center justify-center bg-[#e4ffcc] mb-4">
                <CheckCircle className="h-6 w-6 text-[#6bbb2b]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure Testing</h3>
              <p className="text-gray-600">
                Time-limited exams, randomized questions, and monitored sessions for secure assessment.
              </p>
            </div>
            
            <div className="p-6 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="rounded-full w-12 h-12 flex items-center justify-center bg-[#e4ffcc] mb-4">
                <FileSpreadsheet className="h-6 w-6 text-[#6bbb2b]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Comprehensive Analytics</h3>
              <p className="text-gray-600">
                Track student performance over time with detailed insights and exportable reports.
              </p>
            </div>
            
            <div className="p-6 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="rounded-full w-12 h-12 flex items-center justify-center bg-[#e4ffcc] mb-4">
                <BookOpen className="h-6 w-6 text-[#6bbb2b]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Student-Friendly Interface</h3>
              <p className="text-gray-600">
                Intuitive exam-taking experience with clear instructions and progress tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-[#e4ffcc]">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Examination Process?</h2>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Join thousands of educators and students who use GreenExam Hub for reliable and efficient testing.
          </p>
          <Link to="/login">
            <Button className="bg-[#abfb6b] text-black hover:bg-[#9dea5d] h-12 px-8 text-lg">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-800 text-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <BookOpen className="h-6 w-6 text-[#abfb6b]" />
              <span className="text-xl font-bold">GreenExam Hub</span>
            </div>
            <div className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} GreenExam Hub. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
