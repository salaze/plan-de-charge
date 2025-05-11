
import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useRealtimeUpdates = (onUpdate: () => void) => {
  // Utiliser un délai pour éviter les mises à jour trop fréquentes
  const debounceTimerRef = useRef<number | null>(null);
  const pendingUpdatesRef = useRef(0);
  const isProcessingRef = useRef(false);
  
  // Fonction pour gérer les mises à jour avec debounce
  const debouncedUpdate = useCallback(() => {
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }
    
    pendingUpdatesRef.current += 1;
    
    if (!isProcessingRef.current) {
      debounceTimerRef.current = window.setTimeout(() => {
        if (pendingUpdatesRef.current > 0) {
          isProcessingRef.current = true;
          
          // Si plusieurs mises à jour sont en attente, afficher un message spécial
          if (pendingUpdatesRef.current > 1) {
            toast.info(`Actualisation des ${pendingUpdatesRef.current} modifications détectées`);
          } else {
            toast.info('Actualisation des données');
          }
          
          // Réinitialiser le compteur et effectuer la mise à jour
          pendingUpdatesRef.current = 0;
          onUpdate();
          
          // Laisser un délai avant d'autoriser une nouvelle mise à jour
          setTimeout(() => {
            isProcessingRef.current = false;
            
            // Si d'autres mises à jour sont arrivées entre temps, les traiter
            if (pendingUpdatesRef.current > 0) {
              debouncedUpdate();
            }
          }, 1000);
        }
      }, 1000); // Délai de debounce
    }
  }, [onUpdate]);

  useEffect(() => {
    // Configurer les abonnements en temps réel avec optimisation
    const scheduleChannel = supabase
      .channel('statistics-schedule-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employe_schedule'
        },
        () => {
          console.log('Changement dans le planning détecté');
          debouncedUpdate();
        }
      )
      .subscribe();

    const employeeChannel = supabase
      .channel('statistics-employees-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employes'
        },
        () => {
          console.log('Changement d\'employé détecté');
          debouncedUpdate();
        }
      )
      .subscribe();

    // Écouteur d'événement personnalisé pour forcer l'actualisation
    const handleForceReload = () => {
      console.log('Rechargement forcé des statistiques');
      debouncedUpdate();
    };
    
    window.addEventListener('forceStatisticsReload', handleForceReload);

    return () => {
      // Nettoyage des ressources
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
      
      window.removeEventListener('forceStatisticsReload', handleForceReload);
      supabase.removeChannel(scheduleChannel);
      supabase.removeChannel(employeeChannel);
    };
  }, [debouncedUpdate]);

  // Fonction optimisée pour rafraîchir les données
  const refreshData = useCallback(() => {
    if (isProcessingRef.current) {
      toast.info('Actualisation déjà en cours');
      return;
    }
    
    toast.info('Actualisation des statistiques...');
    onUpdate();
  }, [onUpdate]);

  return { refreshData };
};
