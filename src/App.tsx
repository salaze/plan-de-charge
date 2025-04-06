
import { ThemeProvider } from '@/components/theme-provider';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import AdminLogin from '@/pages/AdminLogin';
import NotFound from '@/pages/NotFound';
import Index from '@/pages/Index';
import Employees from '@/pages/Employees';
import Admin from '@/pages/Admin';
import Export from '@/pages/Export';
import Statistics from '@/pages/Statistics';
import Settings from '@/pages/Settings';
import { AdminRoute } from '@/components/AdminRoute';
import { EmployeeRoute } from '@/components/EmployeeRoute';
import { AuthProvider } from '@/contexts/AuthContext';
import InitApp from '@/pages/InitApp';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" attribute="class">
        <AuthProvider>
          <div className="app">
            <Routes>
              <Route path="/login" element={<AdminLogin />} />
              <Route path="/" element={<Index />} />
              <Route path="/init" element={<InitApp />} />
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
          </div>
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
