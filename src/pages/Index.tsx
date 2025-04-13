import React, { useEffect, useState, useCallback } from 'react';
import { Layout } from '@/components/layout/Layout';
import { PlanningGrid } from '@/components/calendar/PlanningGrid';
import { LegendModal } from '@/components/calendar/LegendModal';
import { PlanningToolbar } from '@/components/planning/PlanningToolbar';
import { usePlanningState } from '@/hooks/usePlanningState';
import { useAuth } from '@/contexts/AuthContext';
import { SupabaseStatusIndicator } from '@/components/supabase/SupabaseStatusIndicator';
import { Button } from '@/components/ui/button';
import { checkSupabaseConnectionFast } from '@/utils/supabase/connectionChecker';
import { toast } from 'sonner';
import { checkTableExists } from '@/utils/supabase/statusTableChecker';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

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
      console.log("Employés chargés sur la page d'index:", data.employees);
    }
  }, [data.employees]);
  
  // Vérifier la connexion au démarrage de façon optimisée
  const handleTestConnection = useCallback(async () => {
    // Éviter plusieurs tests simultanés
    if (isCheckingConnection) return;
    
    setIsCheckingConnection(true);
    
    try {
      console.log("Lancement du test de connexion à Supabase...");
      
      // Utiliser le test de connexion rapide
      const isConnected = await checkSupabaseConnectionFast();
      
      setLastConnectionResult(!!isConnected);
      
      if (isConnected) {
        toast.success("Connexion réussie à Supabase");
        console.log("Test de connexion réussi");
      } else {
        toast.error("Échec de connexion à Supabase");
        console.error("Test de connexion échoué");
      }
    } catch (error) {
      console.error("Erreur lors du test de connexion:", error);
      toast.error("Erreur lors du test de connexion");
      setLastConnectionResult(false);
    } finally {
      setIsCheckingConnection(false);
    }
  }, [isCheckingConnection]);
  
  // Vérifier la connexion au démarrage, mais pas à chaque rendu
  useEffect(() => {
    if (isAdmin) {
      const initialCheck = async () => {
        // Ne pas bloquer l'interface pendant le chargement
        setTimeout(async () => {
          await handleTestConnection();
          
          // Vérifier aussi les tables nécessaires (de façon non bloquante)
          try {
            const statusTableExists = await checkTableExists('statuts');
            
            if (!statusTableExists) {
              toast.warning("La table 'statuts' n'est pas accessible. Certaines fonctionnalités peuvent être limitées.");
            }
          } catch (error) {
            console.error("Erreur lors de la vérification des tables:", error);
          }
        }, 1000);
      };
      
      initialCheck();
    }
  }, [isAdmin, handleTestConnection]);
  
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
                      {lastConnectionResult === true ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : lastConnectionResult === false ? (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      ) : null}
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
