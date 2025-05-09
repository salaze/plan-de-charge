
import { useEffect, useCallback } from 'react';

export function useStatusUpdateEvents(onStatusUpdate: () => void) {
  // Custom event handler for status updates
  const handleStatusesUpdated = useCallback((event: Event) => {
    console.log("statusesUpdated event received");
    
    // Check if we should avoid automatic refresh
    const customEvent = event as CustomEvent;
    const noRefresh = customEvent.detail?.noRefresh === true;
    const fromSync = customEvent.detail?.fromSync === true;
    
    // If both flags are present, don't execute any action
    if (noRefresh && fromSync) {
      console.log("Both noRefresh and fromSync flags are present, no action needed");
      return;
    }
    
    // If the event does not request to avoid refresh, refresh
    if (!noRefresh) {
      // Add slight delay to prevent UI jank
      setTimeout(() => {
        onStatusUpdate();
      }, 300);
    }
  }, [onStatusUpdate]);

  // Listen for status update events
  useEffect(() => {
    window.addEventListener('statusesUpdated', handleStatusesUpdated);
    
    // Clean up on unmount
    return () => {
      window.removeEventListener('statusesUpdated', handleStatusesUpdated);
    };
  }, [handleStatusesUpdated]);
}
