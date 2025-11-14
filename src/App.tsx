import React, { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, ThemeProvider } from "@/contexts";
import ErrorBoundary from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoadingSpinner from "@/components/LoadingSpinner";
import SkipToContent from "@/components/SkipToContent";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Problems = lazy(() => import("./pages/Problems"));
const ProblemDetail = lazy(() => import("./pages/ProblemDetail"));
const ProblemsBySubTopic = lazy(() => import("./pages/ProblemsBySubTopic"));
const ProblemsByTopic = lazy(() => import("./pages/ProblemsByTopic"));
const Contest = lazy(() => import("./pages/Contest"));
const ContestDetail = lazy(() => import("./pages/ContestDetail"));
const ContestProblemDetail = lazy(() => import("./pages/ContestProblemDetail"));
const ContestSubmissionDetail = lazy(() => import("./pages/ContestSubmissionDetail"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const CourseProblemsList = lazy(() => import("./pages/CourseProblemsList"));
const CourseProblemDetail = lazy(() => import("./pages/CourseProblemDetail"));
const StudyPlan = lazy(() => import("./pages/StudyPlan"));
const Profile = lazy(() => import("./pages/Profile"));
const EditProfile = lazy(() => import("./pages/EditProfile"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const SubmissionDetail = lazy(() => import("./pages/SubmissionDetail"));
const Ranking = lazy(() => import("./pages/Ranking"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Create QueryClient with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Loading component for Suspense fallback
const PageLoading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <SkipToContent />
              <Suspense fallback={<PageLoading />}>
                <Routes>
                  {/* Public routes - only login and register */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Protected routes - require authentication */}
                  <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                  <Route path="/problems" element={<ProtectedRoute><Problems /></ProtectedRoute>} />
                  <Route path="/problems/by-topic/:topicId" element={<ProtectedRoute><ProblemsByTopic /></ProtectedRoute>} />
                  <Route path="/problems/by-sub-topic/:subTopicId" element={<ProtectedRoute><ProblemsBySubTopic /></ProtectedRoute>} />
                  <Route path="/problems/by-sub-topic/:subTopicId/without-testcases" element={<ProtectedRoute><ProblemsBySubTopic /></ProtectedRoute>} />
                  <Route path="/problems/:id" element={<ProtectedRoute><ProblemDetail /></ProtectedRoute>} />
                  <Route path="/contest" element={<ProtectedRoute><Contest /></ProtectedRoute>} />
                  <Route path="/contest/:contestId" element={<ProtectedRoute><ContestDetail /></ProtectedRoute>} />
                  <Route path="/contest/:contestId/problems/:problemId" element={<ProtectedRoute><ContestProblemDetail /></ProtectedRoute>} />
                  <Route path="/contest/:contestId/submissions/:id" element={<ProtectedRoute><ContestSubmissionDetail /></ProtectedRoute>} />
                  <Route path="/courses/:id" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
                  <Route path="/courses/:id/problems" element={<ProtectedRoute><CourseProblemsList /></ProtectedRoute>} />
                  <Route path="/courses/:id/problems/:problemId" element={<ProtectedRoute><CourseProblemDetail /></ProtectedRoute>} />
                  <Route path="/study-plan" element={<ProtectedRoute><StudyPlan /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
                  <Route path="/submissions/:id" element={<ProtectedRoute><SubmissionDetail /></ProtectedRoute>} />
                  <Route path="/ranking" element={<ProtectedRoute><Ranking /></ProtectedRoute>} />
                  
                  {/* Catch-all route */}
                  <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
