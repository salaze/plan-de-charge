
import { useRef, useEffect, useCallback } from 'react';

export function useStatusDialogTracker(refreshData: () => void) {
  // State to track if a status dialog is currently open
  const isStatusDialogOpenRef = useRef(false);
  const forceRefreshPendingRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const lastInteractionTimeRef = useRef<number>(0);
  
  // Memoize handlers to prevent them from causing re-renders
  const handleStatusesUpdated = useCallback((event: Event) => {
    console.log("Index: statusesUpdated event received");
    
    // Check if we should avoid automatic refresh
    const customEvent = event as CustomEvent;
    const noRefresh = customEvent.detail?.noRefresh === true;
    const fromSync = customEvent.detail?.fromSync === true;
    
    // Si les deux flags sont présents, n'exécuter aucune action
    if (noRefresh && fromSync) {
      console.log("Both noRefresh and fromSync flags are present, no action needed");
      return;
    }
    
    // Si une boîte de dialogue est ouverte, reporter l'actualisation
    if (isStatusDialogOpenRef.current) {
      console.log("Status dialog open, refresh postponed");
      // Marquer qu'une actualisation sera nécessaire à la fermeture
      forceRefreshPendingRef.current = true;
      return;
    }
    
    // Vérifier si une actualisation a été effectuée récemment (dans les 5 dernières secondes)
    const now = Date.now();
    if (now - lastInteractionTimeRef.current < 5000) {
      console.log("Recent interaction detected, postponing refresh");
      forceRefreshPendingRef.current = true;
      return;
    }
    
    // If the event does not request to avoid refresh, refresh
    if (!noRefresh) {
      console.log("Refreshing data");
      // Use a delay to avoid too frequent refreshes
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = window.setTimeout(() => {
        lastInteractionTimeRef.current = Date.now();
        refreshData();
        timeoutRef.current = null;
      }, 2000) as unknown as number;
    }
  }, [refreshData]);
  
  const handleStatusEditStart = useCallback(() => {
    console.log("Index: Status dialog open - disabling automatic refreshes");
    isStatusDialogOpenRef.current = true;
    lastInteractionTimeRef.current = Date.now();
    
    // Cancel any ongoing refresh timeout
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);
  
  const handleStatusEditEnd = useCallback(() => {
    console.log("Index: Status dialog closed - re-enabling automatic refreshes");
    lastInteractionTimeRef.current = Date.now();
    
    // Use a delay to ensure everything is properly completed
    setTimeout(() => {
      isStatusDialogOpenRef.current = false;
      
      // If a refresh was pending, execute it now
      if (forceRefreshPendingRef.current) {
        console.log("Executing postponed refresh");
        forceRefreshPendingRef.current = false;
        
        // Wait a bit longer to ensure updates are properly completed
        setTimeout(() => {
          refreshData();
        }, 2000);
      }
    }, 1500);
  }, [refreshData]);
  
  // Listen for status update events
  useEffect(() => {
    window.addEventListener('statusesUpdated', handleStatusesUpdated);
    window.addEventListener('statusEditStart', handleStatusEditStart);
    window.addEventListener('statusEditEnd', handleStatusEditEnd);
    
    return () => {
      window.removeEventListener('statusesUpdated', handleStatusesUpdated);
      window.removeEventListener('statusEditStart', handleStatusEditStart);
      window.removeEventListener('statusEditEnd', handleStatusEditEnd);
      
      // Clean up any ongoing timeout
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [handleStatusesUpdated, handleStatusEditStart, handleStatusEditEnd]);

  return {
    isStatusDialogOpenRef,
    handleStatusDialogChange: useCallback((isOpen: boolean) => {
      isStatusDialogOpenRef.current = isOpen;
      lastInteractionTimeRef.current = Date.now();
      
      // Emit appropriate events
      if (isOpen) {
        window.dispatchEvent(new CustomEvent('statusEditStart'));
      } else {
        // Add a delay to ensure all operations are completed
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('statusEditEnd'));
        }, 500);
      }
    }, [])
  };
}
