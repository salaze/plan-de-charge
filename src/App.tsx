
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminRoute } from "@/components/AdminRoute";
import { useEffect, useState } from "react";
import { checkSupabaseTables } from "@/utils/initSupabase";
import Index from "./pages/Index";
import Employees from "./pages/Employees";
import Statistics from "./pages/Statistics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

// Fix the TooltipWrapper to ensure it's a proper functional component
const TooltipWrapper = ({ children }: { children: React.ReactNode }) => {
  return <TooltipProvider>{children}</TooltipProvider>;
};

const App = () => {
  const [supabaseInitialized, setSupabaseInitialized] = useState<boolean>(false);
  
  // Initialize Supabase tables check
  useEffect(() => {
    const initializeSupabase = async () => {
      try {
        await checkSupabaseTables();
        setSupabaseInitialized(true);
      } catch (error) {
        console.error("Failed to initialize Supabase:", error);
        // Still set to true so the app can continue loading even if Supabase is not available
        setSupabaseInitialized(true);
      }
    };
    
    initializeSupabase();
  }, []);
  
  // Show a very minimal loading state while initializing Supabase
  if (!supabaseInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
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
