
import { useState, useEffect } from 'react';
import { StatusCode } from '@/types';
import { useSupabaseStatuses } from './useSupabaseStatuses';

export const useAvailableStatuses = (defaultStatuses: StatusCode[] = []) => {
  const [statuses, setStatuses] = useState<StatusCode[]>(defaultStatuses);
  const { statuses: supabaseStatuses, loading } = useSupabaseStatuses();
  
  useEffect(() => {
    // Si nous avons des statuts depuis Supabase, extraire les codes
    if (supabaseStatuses && supabaseStatuses.length > 0) {
      setStatuses(supabaseStatuses.map(s => s.code as StatusCode));
    } else {
      // Utiliser les statuts par défaut fournis si pas de données Supabase
      setStatuses(defaultStatuses);
      
      // Fallback au localStorage si nécessaire (pour la rétrocompatibilité)
      const savedData = localStorage.getItem('planningData');
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          if (data.statuses && data.statuses.length > 0) {
            setStatuses(data.statuses.map((s: any) => s.code as StatusCode));
          }
        } catch (error) {
          console.error("Erreur lors du parsing des données locales:", error);
        }
      }
    }
  }, [supabaseStatuses, defaultStatuses]);
  
  // Écouter les événements personnalisés pour les mises à jour de statuts
  useEffect(() => {
    const handleCustomEvent = () => {
      // Recharger les statuts lorsque l'événement est déclenché
      console.log("Événement de mise à jour des statuts détecté");
    };
    
    // Ajouter les écouteurs d'événements
    window.addEventListener('statusesUpdated', handleCustomEvent);
    
    // Nettoyer les écouteurs lors du démontage
    return () => {
      window.removeEventListener('statusesUpdated', handleCustomEvent);
    };
  }, []);
  
  return { statuses, loading };
};

export default useAvailableStatuses;
