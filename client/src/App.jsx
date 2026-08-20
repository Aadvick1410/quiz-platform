import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { NotFound } from './pages/NotFound';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { QuizManagement } from './pages/admin/QuizManagement';
import { QuestionManagement } from './pages/admin/QuestionManagement';
import { UserManagement } from './pages/admin/UserManagement';
import { CategoryManagement } from './pages/admin/CategoryManagement';
import { AttemptsList } from './pages/admin/AttemptsList';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';

// Admin Pages (Placeholders)

import { Home } from './pages/Home';
import { Leaderboard } from './pages/Leaderboard';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { QuizDetails } from './pages/student/QuizDetails';
import { QuizAttempt } from './pages/student/QuizAttempt';
import { QuizResult } from './pages/student/QuizResult';
import { StudentSettings } from './pages/student/StudentSettings';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{
            style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' }
          }} />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Main App Routes */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/quizzes/:id" element={<QuizDetails />} />
              
              {/* Student Routes */}
              <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
                <Route path="/dashboard" element={<StudentDashboard />} />
              </Route>
              
              {/* Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/quizzes" element={<QuizManagement />} />
                <Route path="/admin/quizzes/:id/questions" element={<QuestionManagement />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/categories" element={<CategoryManagement />} />
                <Route path="/admin/attempts" element={<AttemptsList />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
              </Route>
              <Route path="/settings" element={
                <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
                  <StudentSettings />
                </ProtectedRoute>
              } />
            </Route>
            
            {/* Quiz Attempt without Layout (Full Screen) */}
            <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
              <Route path="/attempt/:id" element={<QuizAttempt />} />
              <Route path="/result/:id" element={<QuizResult />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
