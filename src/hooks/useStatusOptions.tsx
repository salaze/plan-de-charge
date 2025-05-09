
import { useState, useCallback, useEffect, useRef } from 'react';
import { StatusCode } from '@/types';
import { useStatusLoader } from './status/useStatusLoader';
import { useStatusEvents } from './status/useStatusEvents';

export function useStatusOptions() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshingLocal, setIsRefreshingLocal] = useState(false);
  const refreshTimeoutRef = useRef<number | null>(null);
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
  
  // Wrapper for refreshStatuses with debounce protection
  const refreshStatuses = useCallback(() => {
    if (isRefreshingLocal) {
      console.log("useStatusOptions: Refresh already in progress, ignored");
      return;
    }
    
    setIsRefreshingLocal(true);
    
    // Clear any existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    // Call the original refresh function
    originalRefreshStatuses();
    
    // Set timeout to reset the refreshing state
    refreshTimeoutRef.current = window.setTimeout(() => {
      setIsRefreshingLocal(false);
      refreshTimeoutRef.current = null;
    }, 2000); // Increased timeout to prevent rapid successive refreshes
  }, [originalRefreshStatuses, isRefreshingLocal]);
  
  const handleStatusesUpdated = useCallback(() => {
    console.log("useStatusOptions: Status update detected");
    setRefreshKey(prev => prev + 1);
    
    // Prevent refresh if we're already refreshing
    if (!isRefreshingLocal) {
      // Add slight delay before refreshing to prevent UI jank
      window.setTimeout(() => {
        refreshStatuses();
      }, 300);
    }
  }, [refreshStatuses, isRefreshingLocal]);

  // Register for status update events
  useStatusEvents(handleStatusesUpdated);

  // For debugging
  console.log("useStatusOptions: Available statuses =", availableStatuses, "isLoading =", isLoading);

  return {
    statuses: availableStatuses,
    isLoading: isLoading || isRefreshingLocal,
    refreshStatuses
  };
}

export default useStatusOptions;
