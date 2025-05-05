
import { useRef, useEffect } from 'react';

export function useStatusDialogTracker(refreshData: () => void) {
  // State to track if a status dialog is currently open
  const isStatusDialogOpenRef = useRef(false);
  const forceRefreshPendingRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  
  // Listen for status update events
  useEffect(() => {
    const handleStatusesUpdated = (event: Event) => {
      console.log("Index: statusesUpdated event received");
      
      // Check if we should avoid automatic refresh
      const customEvent = event as CustomEvent;
      const noRefresh = customEvent.detail?.noRefresh === true;
      
      // If a dialog is open, postpone the refresh
      if (isStatusDialogOpenRef.current) {
        console.log("Status dialog open, refresh postponed");
        // Mark that a refresh will be needed on closure
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
          refreshData();
          timeoutRef.current = null;
        }, 1500) as unknown as number;
      }
    };
    
    // Handle dialog open and close events
    const handleStatusEditStart = () => {
      console.log("Index: Status dialog open - disabling automatic refreshes");
      isStatusDialogOpenRef.current = true;
      
      // Cancel any ongoing refresh timeout
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
    
    const handleStatusEditEnd = () => {
      console.log("Index: Status dialog closed - re-enabling automatic refreshes");
      
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
      
      // Clean up any ongoing timeout
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [refreshData]);

  return {
    isStatusDialogOpenRef,
    handleStatusDialogChange: (isOpen: boolean) => {
      isStatusDialogOpenRef.current = isOpen;
      
      // Emit appropriate events
      if (isOpen) {
        window.dispatchEvent(new CustomEvent('statusEditStart'));
      } else {
        // Add a delay to ensure all operations are completed
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('statusEditEnd'));
        }, 500);
      }
    }
  };
}
