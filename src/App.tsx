
import React, { lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { AdminRoute } from '@/components/AdminRoute';
import { EmployeeRoute } from '@/components/EmployeeRoute';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/hooks/use-toast';
import './App.css';

// Import Index directly instead of using lazy loading
import Index from '@/pages/Index';

// Lazy-loaded components for other routes
const Admin = lazy(() => import('@/pages/Admin'));
const Employees = lazy(() => import('@/pages/Employees'));
const Export = lazy(() => import('@/pages/Export'));
const Settings = lazy(() => import('@/pages/Settings'));
const Statistics = lazy(() => import('@/pages/Statistics'));
const Login = lazy(() => import('@/pages/AdminLogin'));
const InitApp = lazy(() => import('@/pages/InitApp'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function App() {
  return (
    <ToastProvider>
      <ThemeProvider defaultTheme="system" storageKey="planning-theme" attribute="class" enableSystem>
        <AuthProvider>
          <BrowserRouter>
            <React.Suspense fallback={<div className="flex items-center justify-center h-screen">Chargement...</div>}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
                <Route path="/employees" element={<AdminRoute><Employees /></AdminRoute>} />
                <Route path="/export" element={<AdminRoute><Export /></AdminRoute>} />
                <Route path="/statistics" element={<AdminRoute><Statistics /></AdminRoute>} />
                <Route path="/settings" element={<AdminRoute><Settings /></AdminRoute>} />
                <Route path="/login" element={<Login />} />
                <Route path="/init" element={<InitApp />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </React.Suspense>
            <SonnerToaster />
            <Toaster />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ToastProvider>
  );
}

export default App;
