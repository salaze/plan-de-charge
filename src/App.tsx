
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
import Export from '@/pages/export';
import Settings from '@/pages/settings';
import Employees from '@/pages/Employees';
import Statistics from '@/pages/Statistics';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="planning-theme">
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
              
              {/* Fallback route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <SonnerToaster />
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
