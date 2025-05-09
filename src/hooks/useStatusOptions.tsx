
import { useState, useCallback, useEffect } from 'react';
import { StatusCode } from '@/types';
import { useStatusLoader } from './status/useStatusLoader';
import { useStatusEvents } from './status/useStatusEvents';

export function useStatusOptions() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshingLocal, setIsRefreshingLocal] = useState(false);
  const { availableStatuses, isLoading, refreshStatuses: originalRefreshStatuses } = useStatusLoader();
  
  // Wrapper pour la fonction refreshStatuses avec un debounce
  const refreshStatuses = useCallback(() => {
    if (isRefreshingLocal) {
      console.log("useStatusOptions: Rafraîchissement déjà en cours, ignoré");
      return;
    }
    
    setIsRefreshingLocal(true);
    originalRefreshStatuses();
    
    // Délai pour éviter les actualisations trop fréquentes
    setTimeout(() => {
      setIsRefreshingLocal(false);
    }, 1500);
  }, [originalRefreshStatuses, isRefreshingLocal]);
  
  const handleStatusesUpdated = useCallback(() => {
    console.log("useStatusOptions: Mise à jour des statuts détectée");
    setRefreshKey(prev => prev + 1);
    // Appel explicite au rafraîchissement
    refreshStatuses();
  }, [refreshStatuses]);

  useStatusEvents(handleStatusesUpdated);

  // Pour déboguer
  console.log("useStatusOptions: Statuts disponibles =", availableStatuses, "isLoading =", isLoading);

  return {
    statuses: availableStatuses,
    isLoading: isLoading || isRefreshingLocal,
    refreshStatuses
  };
}

export default useStatusOptions;
