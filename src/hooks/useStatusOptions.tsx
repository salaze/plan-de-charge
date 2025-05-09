
import { useState, useCallback, useEffect, useRef } from 'react';
import { StatusCode } from '@/types';
import { useStatusLoader } from './status/useStatusLoader';
import { useStatusEvents } from './status/useStatusEvents';

export function useStatusOptions() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshingLocal, setIsRefreshingLocal] = useState(false);
  const refreshTimeoutRef = useRef<number | null>(null);
  const refreshRequestPendingRef = useRef<boolean>(false);
  const { availableStatuses, isLoading, refreshStatuses: originalRefreshStatuses } = useStatusLoader();
  
  // Clear any existing timeout on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    };
  }, []);
  
  // Wrapper for refreshStatuses with debounce and protection
  const refreshStatuses = useCallback(() => {
    // Si une requête est déjà en cours, on la met en attente
    if (isRefreshingLocal) {
      console.log("useStatusOptions: Refresh already in progress, marking as pending");
      refreshRequestPendingRef.current = true;
      return;
    }
    
    setIsRefreshingLocal(true);
    
    // Clear any existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    // Call the original refresh function
    console.log("useStatusOptions: Executing refresh");
    originalRefreshStatuses();
    
    // Set timeout to reset the refreshing state
    refreshTimeoutRef.current = window.setTimeout(() => {
      setIsRefreshingLocal(false);
      refreshTimeoutRef.current = null;
      
      // Si une requête était en attente, la traiter maintenant
      if (refreshRequestPendingRef.current) {
        console.log("useStatusOptions: Processing pending refresh request");
        refreshRequestPendingRef.current = false;
        // Ajouter un délai pour éviter les cascades
        setTimeout(refreshStatuses, 500);
      }
    }, 2000); // Increased timeout to prevent rapid successive refreshes
  }, [originalRefreshStatuses]);
  
  // Gérer les mises à jour avec un debounce plus strict
  const handleStatusesUpdated = useCallback(() => {
    console.log("useStatusOptions: Status update detected");
    setRefreshKey(prev => prev + 1);
    
    // Vérifier s'il y a un marqueur pour éviter la boucle
    const event = window.event as CustomEvent;
    const noRefresh = event?.detail?.noRefresh === true;
    const fromSync = event?.detail?.fromSync === true;
    
    if (noRefresh || fromSync) {
      console.log("useStatusOptions: Update ignored to prevent loops (noRefresh or fromSync flag detected)");
      return;
    }
    
    // Prevent refresh if we're already refreshing
    if (!isRefreshingLocal) {
      // Add longer delay before refreshing to prevent UI jank
      window.setTimeout(() => {
        refreshStatuses();
      }, 1000);
    } else {
      refreshRequestPendingRef.current = true;
    }
  }, [refreshStatuses, isRefreshingLocal]);

  // Register for status update events
  useStatusEvents(handleStatusesUpdated);

  return {
    statuses: availableStatuses,
    isLoading: isLoading || isRefreshingLocal,
    refreshStatuses
  };
}

export default useStatusOptions;
