
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminRoute } from "@/components/AdminRoute";
import { EmployeeRoute } from "@/components/EmployeeRoute";
import { useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Employees from "./pages/Employees";
import Statistics from "./pages/Statistics";
import Export from "./pages/Export";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";

const queryClient = new QueryClient();

const ProtectedIndex = () => {
  const { isAdmin } = useAuth();
  
  if (!isAdmin) {
    return <Navigate to="/employees" replace />;
  }
  
  return <Index />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route 
              path="/" 
              element={
                <EmployeeRoute>
                  <ProtectedIndex />
                </EmployeeRoute>
              } 
            />
            <Route 
              path="/employees" 
              element={
                <EmployeeRoute>
                  <Employees />
                </EmployeeRoute>
              } 
            />
            <Route 
              path="/statistics" 
              element={
                <AdminRoute>
                  <Statistics />
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
              path="/settings" 
              element={
                <AdminRoute>
                  <Settings />
                </AdminRoute>
              } 
            />
            <Route path="/login" element={<AdminLogin />} />
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
