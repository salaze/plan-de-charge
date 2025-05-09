
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StatusCode, STATUS_LABELS, STATUS_COLORS } from '@/types';
import { toast } from 'sonner';
import { extendStatusCode } from '@/utils/export/statusUtils';

interface UseStatusLoaderResult {
  availableStatuses: StatusCode[];
  isLoading: boolean;
  refreshStatuses: () => void;
}

export function useStatusLoader(): UseStatusLoaderResult {
  const [availableStatuses, setAvailableStatuses] = useState<StatusCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const retryCountRef = useRef(0);
  const loadingTimeoutRef = useRef<number | null>(null);
  const isMounted = useRef(true);
  const isRefreshingRef = useRef(false);
  const lastRefreshTimeRef = useRef<number>(0);

  const loadStatusesFromSupabase = async () => {
    // Don't refresh if unmounted or already refreshing
    if (!isMounted.current || isRefreshingRef.current) return;
    
    // Debounce refreshes - don't allow more than one every 1.5 seconds
    const now = Date.now();
    if (now - lastRefreshTimeRef.current < 1500) {
      console.log("Too many refresh attempts too quickly, throttled");
      return;
    }
    
    lastRefreshTimeRef.current = now;
    isRefreshingRef.current = true;
    setIsLoading(true);
    
    // Clear any existing loading timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    
    // Set a maximum timeout for loading
    loadingTimeoutRef.current = window.setTimeout(() => {
      if (!isMounted.current) return;
      
      console.log("Timeout during status loading");
      setIsLoading(false);
      const defaultStatuses: StatusCode[] = [
        'none', 'assistance', 'vigi', 'formation', 'projet', 
        'conges', 'management', 'tp', 'coordinateur', 'absence',
        'regisseur', 'demenagement', 'permanence', 'parc'
      ];
      setAvailableStatuses(defaultStatuses);
      isRefreshingRef.current = false;
    }, 5000); // Extended timeout to 5 seconds to prevent premature fallback
    
    try {
      console.log("Loading status options from Supabase...");
      
      const { data: statusData, error } = await supabase
        .from('statuts')
        .select('code, libelle, couleur')
        .order('display_order', { ascending: true });
      
      // Stop the timeout once data is retrieved
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      
      if (error) {
        console.error("Error loading status options:", error);
        throw error;
      }
      
      if (!isMounted.current) return;
      
      console.log("Status options retrieved:", statusData);
      retryCountRef.current = 0;
      
      if (Array.isArray(statusData) && statusData.length > 0) {
        // Update STATUS_LABELS and STATUS_COLORS dictionaries
        statusData.forEach(status => {
          if (status && status.code) {
            const statusCode = extendStatusCode(status.code);
            STATUS_LABELS[statusCode] = status.libelle || status.code;
            STATUS_COLORS[statusCode] = status.couleur || 'bg-gray-500 text-white';
          }
        });
        
        // Convert codes to StatusCode
        const supabaseStatuses = statusData
          .filter((status) => status && status.code && status.code.trim() !== '')
          .map((status) => extendStatusCode(status.code));
        
        console.log("Valid status options:", supabaseStatuses);
        setAvailableStatuses(supabaseStatuses);
      } else {
        console.log("No statuses found, using defaults");
        const defaultStatuses: StatusCode[] = [
          'none', 'assistance', 'vigi', 'formation', 'projet', 
          'conges', 'management', 'tp', 'coordinateur', 'absence',
          'regisseur', 'demenagement', 'permanence', 'parc'
        ];
        setAvailableStatuses(defaultStatuses);
      }
    } catch (error) {
      console.error('Error loading status options from Supabase:', error);
      
      if (!isMounted.current) return;
      
      if (retryCountRef.current < 2) { // Reduced retry count
        retryCountRef.current++;
        console.log(`Retry ${retryCountRef.current}/2 loading statuses`);
        setTimeout(loadStatusesFromSupabase, 2000);
        return;
      }
      
      const defaultStatuses: StatusCode[] = [
        'none', 'assistance', 'vigi', 'formation', 'projet', 
        'conges', 'management', 'tp', 'coordinateur', 'absence',
        'regisseur', 'demenagement', 'permanence', 'parc'
      ];
      setAvailableStatuses(defaultStatuses);
    } finally {
      // Always end the loading state
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      
      if (isMounted.current) {
        setIsLoading(false);
      }
      
      // Add delay before allowing another refresh
      setTimeout(() => {
        isRefreshingRef.current = false;
      }, 1000);
    }
  };

  // Function to manually trigger a status refresh
  const refreshStatuses = () => {
    if (isRefreshingRef.current) {
      console.log("Status refresh already in progress, ignored");
      return;
    }
    console.log("Manual status refresh requested...");
    loadStatusesFromSupabase();
  };

  // Effect for loading data when the component mounts
  useEffect(() => {
    console.log("useStatusLoader: Initial component mount");
    // Reset state to avoid issues
    isMounted.current = true;
    isRefreshingRef.current = false;
    lastRefreshTimeRef.current = 0;
    
    // Initialize status loading
    loadStatusesFromSupabase();
    
    // Listen for status update events
    const handleStatusesUpdated = (event: Event) => {
      const customEvent = event as CustomEvent;
      // Avoid infinite loops by ignoring events from sync
      const fromSync = customEvent.detail?.fromSync === true;
      const noRefresh = customEvent.detail?.noRefresh === true;
      
      if (!fromSync && !isRefreshingRef.current && !noRefresh) {
        console.log("statusesUpdated event received, reloading statuses");
        // Add slight delay to prevent UI jank
        setTimeout(() => {
          loadStatusesFromSupabase();
        }, 300);
      } else {
        console.log("statusesUpdated event ignored to prevent loop");
      }
    };
    
    window.addEventListener('statusesUpdated', handleStatusesUpdated);
    
    // Set up Supabase real-time changes listener
    const channel = supabase
      .channel('statuts-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'statuts' },
        (payload) => {
          if (isRefreshingRef.current) {
            console.log("Status table change detected, but ignored because refresh in progress");
            return;
          }
          console.log("Status table change detected:", payload);
          // Add slight delay to prevent UI jank
          setTimeout(() => {
            loadStatusesFromSupabase();
          }, 500);
        }
      )
      .subscribe();
    
    // Clean up on unmount
    return () => {
      console.log("useStatusLoader: Component unmount");
      isMounted.current = false;
      window.removeEventListener('statusesUpdated', handleStatusesUpdated);
      supabase.removeChannel(channel);
      
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, []);

  return { availableStatuses, isLoading, refreshStatuses };
}
