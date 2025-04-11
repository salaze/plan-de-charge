
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminRoute } from "@/components/AdminRoute";
import { useEffect } from "react";
import { checkSupabaseTables } from "@/utils/initSupabase";
import Index from "./pages/Index";
import Employees from "./pages/Employees";
import Statistics from "./pages/Statistics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";

const queryClient = new QueryClient();

// Fix the TooltipWrapper to ensure it's a proper functional component
const TooltipWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <TooltipProvider>{children}</TooltipProvider>;
};

const App = () => {
  // Initialize Supabase tables check
  useEffect(() => {
    checkSupabaseTables();
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipWrapper>
            <Routes>
              {/* Page principale accessible sans authentification */}
              <Route path="/" element={<Index />} />
              
              <Route 
                path="/employees" 
                element={
                  <AdminRoute>
                    <Employees />
                  </AdminRoute>
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
            <Toaster />
            <Sonner />
          </TooltipWrapper>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
