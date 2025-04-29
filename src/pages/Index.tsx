
import React, { useEffect, useRef } from 'react';
import { Layout } from '@/components/layout/Layout';
import { LegendModal } from '@/components/calendar/LegendModal';
import { PlanningToolbar } from '@/components/planning/PlanningToolbar';
import { usePlanningState } from '@/hooks/usePlanningState';
import { useAuth } from '@/contexts/AuthContext';
import { ConnectionErrorDisplay } from '@/components/planning/ConnectionErrorDisplay';
import { OfflineAlert } from '@/components/planning/OfflineAlert';
import { PlanningContent } from '@/components/planning/PlanningContent';
import { PlanningRefreshButton } from '@/components/planning/PlanningRefreshButton';

const Index = () => {
  const { isAdmin } = useAuth();
  const {
    data,
    originalData,
    currentYear,
    currentMonth,
    filters,
    isLegendOpen,
    loading,
    isOnline,
    connectionError,
    setIsLegendOpen,
    handleMonthChange,
    handleStatusChange,
    handleFiltersChange,
    refreshData
  } = usePlanningState();
  
  // État pour savoir si un dialogue de statut est actuellement ouvert
  const isStatusDialogOpenRef = useRef(false);
  const forceRefreshPendingRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  
  // Écouter les événements de mise à jour des statuts
  useEffect(() => {
    const handleStatusesUpdated = (event: Event) => {
      console.log("Index: Événement statusesUpdated reçu");
      
      // Vérifier si on doit éviter le rafraîchissement automatique
      const customEvent = event as CustomEvent;
      const noRefresh = customEvent.detail?.noRefresh === true;
      
      // Si un dialogue est ouvert, on reporte l'actualisation
      if (isStatusDialogOpenRef.current) {
        console.log("Dialogue de statut ouvert, actualisation reportée");
        // On marque qu'une actualisation sera nécessaire à la fermeture
        forceRefreshPendingRef.current = true;
        return;
      }
      
      // Si l'événement ne demande pas d'éviter le rafraîchissement, on actualise
      if (!noRefresh) {
        console.log("Actualisation des données");
        // Utiliser un délai pour éviter les actualisations trop fréquentes
        if (timeoutRef.current !== null) {
          window.clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = window.setTimeout(() => {
          refreshData();
          timeoutRef.current = null;
        }, 1500) as unknown as number;
      }
    };
    
    // Gérer les événements d'ouverture et fermeture du dialogue
    const handleStatusEditStart = () => {
      console.log("Index: Dialogue de statut ouvert - désactivation des actualisations automatiques");
      isStatusDialogOpenRef.current = true;
      
      // Annuler tout timeout d'actualisation en cours
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
    
    const handleStatusEditEnd = () => {
      console.log("Index: Dialogue de statut fermé - réactivation des actualisations automatiques");
      
      // Utiliser un délai pour s'assurer que tout est bien terminé
      setTimeout(() => {
        isStatusDialogOpenRef.current = false;
        
        // Si une actualisation était en attente, on l'exécute maintenant
        if (forceRefreshPendingRef.current) {
          console.log("Exécution de l'actualisation reportée");
          forceRefreshPendingRef.current = false;
          
          // Attendre un peu plus pour s'assurer que les mises à jour sont bien terminées
          setTimeout(() => {
            refreshData();
          }, 1500);
        }
      }, 1000);
    };
    
    window.addEventListener('statusesUpdated', handleStatusesUpdated);
    window.addEventListener('statusEditStart', handleStatusEditStart);
    window.addEventListener('statusEditEnd', handleStatusEditEnd);
    
    return () => {
      window.removeEventListener('statusesUpdated', handleStatusesUpdated);
      window.removeEventListener('statusEditStart', handleStatusEditStart);
      window.removeEventListener('statusEditEnd', handleStatusEditEnd);
      
      // Nettoyer tout timeout en cours
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [refreshData]);
  
  const handleReconnect = () => {
    window.location.reload();
  };
  
  const handleStatusDialogChange = (isOpen: boolean) => {
    isStatusDialogOpenRef.current = isOpen;
    
    // Émettre les événements appropriés
    if (isOpen) {
      window.dispatchEvent(new CustomEvent('statusEditStart'));
    } else {
      // Ajouter un délai pour s'assurer que toutes les opérations sont terminées
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('statusEditEnd'));
      }, 500);
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <PlanningToolbar 
            year={currentYear}
            month={currentMonth}
            isAdmin={isAdmin}
            employees={originalData.employees || []}
            projects={originalData.projects || []}
            filters={filters}
            onMonthChange={handleMonthChange}
            onShowLegend={() => setIsLegendOpen(true)}
            onFiltersChange={handleFiltersChange}
          />
          
          <PlanningRefreshButton 
            onRefresh={refreshData}
            disabled={loading || isStatusDialogOpenRef.current}
          />
        </div>
        
        {connectionError ? (
          <ConnectionErrorDisplay 
            errorMessage={connectionError}
            onReconnect={handleReconnect}
          />
        ) : (
          <div className="glass-panel p-1 md:p-4 animate-scale-in">
            <PlanningContent
              loading={loading}
              year={currentYear}
              month={currentMonth}
              employees={data.employees || []}
              projects={data.projects || []}
              isAdmin={isAdmin}
              handleStatusChange={handleStatusChange}
              onStatusDialogChange={handleStatusDialogChange}
            />
          </div>
        )}
        
        <LegendModal 
          isOpen={isLegendOpen}
          onClose={() => setIsLegendOpen(false)}
          projects={data.projects || []}
        />
        
        <OfflineAlert
          isOpen={!isOnline && !loading && !connectionError}
          onReconnect={handleReconnect}
        />
      </div>
    </Layout>
  );
};

export default Index;
