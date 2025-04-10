
import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';

// Auth context
import { AuthProvider } from '@/contexts/auth';

// Protected routes
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Pages (import main pages directly for better performance)
import Dashboard from '@/pages/dashboard';
import Login from '@/pages/login';
import NotFound from '@/pages/not-found';
import Planning from '@/pages/planning';
import Export from '@/pages/Export'; // Fixed casing
import Settings from '@/pages/Settings'; // Fixed casing
import Employees from '@/pages/Employees';
import Statistics from '@/pages/Statistics';
import Admin from '@/pages/Admin';

// Import our toast provider
import { ToastProvider } from '@/hooks/toast';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="planning-theme">
      {/* Wrap everything in ToastProvider */}
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<div className="flex h-screen items-center justify-center">Chargement...</div>}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                
                {/* Protected routes */}
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
                <Route path="/planning" element={<ProtectedRoute><Planning /></ProtectedRoute>} />
                <Route path="/statistics" element={<ProtectedRoute><Statistics /></ProtectedRoute>} />
                <Route path="/export" element={<ProtectedRoute><Export /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                
                {/* Fallback route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <SonnerToaster />
            <Toaster />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
