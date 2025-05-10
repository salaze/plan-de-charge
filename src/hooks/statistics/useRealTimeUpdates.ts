
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useRealTimeUpdates = (onRefresh: () => void) => {
  // Écouter les mises à jour en temps réel
  useEffect(() => {
    // Configurer les abonnements en temps réel
    const scheduleChannel = supabase
      .channel('statistics-schedule-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employe_schedule'
        },
        (payload) => {
          console.log('Changement dans le planning détecté:', payload);
          toast.info('Mise à jour du planning détectée', {
            description: 'Les statistiques vont être actualisées'
          });
          
          setTimeout(() => {
            onRefresh();
          }, 300);
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
        (payload) => {
          console.log('Changement d\'employé détecté:', payload);
          toast.info('Mise à jour des employés détectée', {
            description: 'Les statistiques vont être actualisées'
          });
          
          setTimeout(() => {
            onRefresh();
          }, 300);
        }
      )
      .subscribe();

    // Écouteur d'événement personnalisé pour forcer l'actualisation
    const handleForceReload = () => {
      console.log('Rechargement forcé des statistiques');
      onRefresh();
    };
    
    window.addEventListener('forceStatisticsReload', handleForceReload);

    return () => {
      window.removeEventListener('forceStatisticsReload', handleForceReload);
      supabase.removeChannel(scheduleChannel);
      supabase.removeChannel(employeeChannel);
    };
  }, [onRefresh]);

  // Fonction pour forcer le rechargement des données
  const forceRefresh = useCallback(() => {
    toast.info('Actualisation des statistiques...');
    onRefresh();
  }, [onRefresh]);

  return { forceRefresh };
};
