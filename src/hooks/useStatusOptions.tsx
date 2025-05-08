
import { useState, useCallback, useEffect } from 'react';
import { StatusCode } from '@/types';
import { useStatusLoader } from './status/useStatusLoader';
import { useStatusEvents } from './status/useStatusEvents';

export function useStatusOptions() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { availableStatuses, isLoading, refreshStatuses } = useStatusLoader();
  
  const handleStatusesUpdated = useCallback(() => {
    console.log("useStatusOptions: Mise à jour des statuts détectée");
    setRefreshKey(prev => prev + 1);
    refreshStatuses(); // Appel explicite au rafraîchissement
  }, [refreshStatuses]);

  useStatusEvents(handleStatusesUpdated);

  // Pour déboguer
  console.log("useStatusOptions: Statuts disponibles =", availableStatuses, "isLoading =", isLoading);

  return {
    statuses: availableStatuses,
    isLoading,
    refreshStatuses
  };
}

export default useStatusOptions;
