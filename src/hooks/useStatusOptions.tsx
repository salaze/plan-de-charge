
import { useState, useCallback, useEffect, useRef } from 'react';
import { StatusCode } from '@/types';
import { useStatusLoader } from './status/useStatusLoader';
import { useStatusEvents } from './status/useStatusEvents';
import { syncStatusesWithDatabase } from '@/utils/supabase/status';

export function useStatusOptions() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshingLocal, setIsRefreshingLocal] = useState(false);
  const refreshTimeoutRef = useRef<number | null>(null);
  const refreshRequestPendingRef = useRef<boolean>(false);
  const lastRefreshTimeRef = useRef<number>(0);
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
  
  // Synchronize statuses on load
  useEffect(() => {
    const syncAndRefresh = async () => {
      try {
        // Sync statuses with database
        await syncStatusesWithDatabase();
        // Then refresh local statuses
        originalRefreshStatuses();
      } catch (error) {
        console.error("Error synchronizing statuses", error);
      }
    };
    
    syncAndRefresh();
  }, [originalRefreshStatuses]);
  
  // Wrapper for refreshStatuses with debounce and protection
  const refreshStatuses = useCallback(async () => {
    // Debounce rapid refreshes
    const now = Date.now();
    if (now - lastRefreshTimeRef.current < 1000) {
      console.log("Request too soon, debouncing");
      return;
    }
    
    lastRefreshTimeRef.current = now;
    
    // If a request is already in progress, queue it
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
    
    try {
      // First sync with database
      await syncStatusesWithDatabase();
      
      // Then call the original refresh function
      console.log("useStatusOptions: Executing refresh");
      originalRefreshStatuses();
      
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Error refreshing statuses", error);
    }
    
    // Set timeout to reset the refreshing state
    refreshTimeoutRef.current = window.setTimeout(() => {
      setIsRefreshingLocal(false);
      refreshTimeoutRef.current = null;
      
      // If a request was pending, process it now
      if (refreshRequestPendingRef.current) {
        console.log("useStatusOptions: Processing pending refresh request");
        refreshRequestPendingRef.current = false;
        // Add delay to avoid cascades
        setTimeout(refreshStatuses, 500);
      }
    }, 1500); // Increased timeout to prevent rapid successive refreshes
  }, [originalRefreshStatuses, isRefreshingLocal]);
  
  // Handle updates with stricter debounce
  const handleStatusesUpdated = useCallback(() => {
    console.log("useStatusOptions: Status update detected");
    setRefreshKey(prev => prev + 1);
    
    // Check if there's a marker to avoid loops
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
      }, 800);
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
