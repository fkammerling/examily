import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import ExamForm from "./pages/teacher/ExamForm";
import ExamTaking from "./pages/student/ExamTaking";
import ExamResults from "./pages/student/ExamResults";
import ExamPreview from "./pages/teacher/ExamPreview";
import ClassManagement from "./pages/teacher/ClassManagement";
import Profile from "./pages/Profile"; // Add this line
import { AuthProvider } from "./context/AuthContext";
import { ExamProvider } from "./context/ExamContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ExamProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/exams/create" element={<ExamForm />} />
                <Route path="/exams/edit/:examId" element={<ExamForm />} />
                <Route path="/exams/view/:examId" element={<ExamPreview />} />
                <Route path="/exams/take/:examId" element={<ExamTaking />} />
                <Route path="/results/:attemptId" element={<ExamResults />} />
                <Route path="/classes" element={<ClassManagement />} />
                <Route path="/profile" element={<Profile />} /> // Add this line
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ExamProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
