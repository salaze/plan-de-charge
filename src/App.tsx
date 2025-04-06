
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';
import AdminLogin from '@/pages/AdminLogin';
import NotFound from '@/pages/NotFound';
import Index from '@/pages/Index';
import Employees from '@/pages/Employees';
import Admin from '@/pages/Admin';
import Export from '@/pages/Export';
import Statistics from '@/pages/Statistics';
import Settings from '@/pages/Settings';
import AdminRoute from '@/components/AdminRoute';
import EmployeeRoute from '@/components/EmployeeRoute';
import { AuthProvider } from '@/contexts/AuthContext';
import InitApp from '@/pages/InitApp'; // Import de la nouvelle page

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="app">
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<AdminLogin />} />
              <Route path="/" element={<Index />} />
              <Route path="/init" element={<InitApp />} /> {/* Nouvelle route pour l'initialisation */}
              <Route
                path="/employees"
                element={
                  <AdminRoute>
                    <Employees />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                }
              />
              <Route
                path="/export"
                element={
                  <AdminRoute>
                    <Export />
                  </AdminRoute>
                }
              />
              <Route
                path="/statistics"
                element={
                  <EmployeeRoute>
                    <Statistics />
                  </EmployeeRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <AdminRoute>
                    <Settings />
                  </AdminRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
