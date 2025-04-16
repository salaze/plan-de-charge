
import React, { useEffect, useState, useCallback } from 'react';
import { Layout } from '@/components/layout/Layout';
import { PlanningGrid } from '@/components/calendar/PlanningGrid';
import { LegendModal } from '@/components/calendar/LegendModal';
import { PlanningToolbar } from '@/components/planning/PlanningToolbar';
import { usePlanningState } from '@/hooks/usePlanningState';
import { useAuth } from '@/contexts/AuthContext';
import { SupabaseStatusIndicator } from '@/components/supabase/SupabaseStatusIndicator';
import { Button } from '@/components/ui/button';
import { checkSupabaseConnectionFast } from '@/utils/supabase/connection';
import { toast } from 'sonner';
import { CheckCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { isAdmin } = useAuth();
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [lastConnectionResult, setLastConnectionResult] = useState<boolean | null>(null);
  const {
    data,
    currentYear,
    currentMonth,
    isLegendOpen,
    isLoading,
    setIsLegendOpen,
    handleMonthChange,
    handleStatusChange
  } = usePlanningState();
  
  // Log employees when they load
  useEffect(() => {
    if (data.employees) {
      console.log("Employés chargés sur la page d'index:", data.employees.length);
    }
  }, [data.employees]);
  
  // Function to establish Supabase connection
  const establishConnection = useCallback(async () => {
    if (isCheckingConnection) return;
    
    setIsCheckingConnection(true);
    
    try {
      // Try to establish a simple Supabase session
      const { data } = await supabase.auth.getSession();
      console.log("Session initiale:", data ? "Existante" : "Non trouvée");
      
      // Use the fast connection check
      const isConnected = await checkSupabaseConnectionFast();
      
      setLastConnectionResult(isConnected);
      
      if (isConnected) {
        toast.success("Connexion automatique réussie à Supabase");
        console.log("Connexion initiale à Supabase réussie");
      } else {
        console.warn("Connexion initiale à Supabase échouée");
      }
    } catch (error) {
      console.error("Erreur lors de l'établissement de connexion:", error);
      setLastConnectionResult(false);
    } finally {
      setIsCheckingConnection(false);
    }
  }, [isCheckingConnection]);
  
  // Connection check handler
  const handleTestConnection = useCallback(async () => {
    // Avoid simultaneous checks
    if (isCheckingConnection) return;
    
    setIsCheckingConnection(true);
    toast.info("Test de connexion à Supabase...");
    
    try {
      const isConnected = await checkSupabaseConnectionFast();
      
      setLastConnectionResult(isConnected);
      
      if (isConnected) {
        toast.success("Connexion réussie à Supabase");
      } else {
        toast.error("Échec de connexion à Supabase");
      }
    } catch (error) {
      console.error("Erreur lors du test de connexion:", error);
      toast.error("Erreur lors du test de connexion");
      setLastConnectionResult(false);
    } finally {
      setIsCheckingConnection(false);
    }
  }, [isCheckingConnection]);
  
  // Establish connection on component mount with a delay
  useEffect(() => {
    // Add a short delay to avoid React initialization issues
    const timer = setTimeout(() => {
      console.log("Tentative d'établissement automatique de la connexion");
      establishConnection();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [establishConnection]);

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Planning</h1>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleTestConnection}
                  disabled={isCheckingConnection}
                  className="flex items-center gap-2"
                >
                  {isCheckingConnection ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span className="ml-1">Test en cours...</span>
                    </>
                  ) : (
                    <>
                      {lastConnectionResult === true && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      <span className="ml-1">Tester Supabase</span>
                    </>
                  )}
                </Button>
                <SupabaseStatusIndicator />
              </div>
            )}
          </div>
        </div>
        
        <PlanningToolbar 
          year={currentYear}
          month={currentMonth}
          onMonthChange={handleMonthChange}
          onShowLegend={() => setIsLegendOpen(true)}
        />
        
        <div className="glass-panel p-1 md:p-4 animate-scale-in overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">Chargement des données...</span>
            </div>
          ) : (
            <PlanningGrid 
              year={currentYear} 
              month={currentMonth} 
              employees={data.employees || []}
              projects={data.projects || []}
              onStatusChange={handleStatusChange}
              isAdmin={isAdmin}
            />
          )}
        </div>
        
        <LegendModal 
          isOpen={isLegendOpen}
          onClose={() => setIsLegendOpen(false)}
          projects={data.projects || []}
        />
      </div>
    </Layout>
  );
};

export default Index;
