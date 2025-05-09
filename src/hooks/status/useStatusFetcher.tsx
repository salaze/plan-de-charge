
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StatusCode, STATUS_LABELS, STATUS_COLORS } from '@/types';
import { extendStatusCode } from '@/utils/export/statusUtils';

interface UseStatusFetcherResult {
  statuses: StatusCode[];
  isLoading: boolean;
  fetchStatuses: () => void;
}

export function useStatusFetcher(): UseStatusFetcherResult {
  const [statuses, setStatuses] = useState<StatusCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMounted = useRef(true);
  const isRefreshingRef = useRef(false);
  const retryCountRef = useRef(0);
  const loadingTimeoutRef = useRef<number | null>(null);
  const lastRefreshTimeRef = useRef<number>(0);

  const fetchStatuses = async () => {
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
      setStatuses(defaultStatuses);
      isRefreshingRef.current = false;
    }, 5000);
    
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
        setStatuses(supabaseStatuses);
      } else {
        console.log("No statuses found, using defaults");
        const defaultStatuses: StatusCode[] = [
          'none', 'assistance', 'vigi', 'formation', 'projet', 
          'conges', 'management', 'tp', 'coordinateur', 'absence',
          'regisseur', 'demenagement', 'permanence', 'parc'
        ];
        setStatuses(defaultStatuses);
      }
    } catch (error) {
      console.error('Error loading status options from Supabase:', error);
      
      if (!isMounted.current) return;
      
      if (retryCountRef.current < 2) {
        retryCountRef.current++;
        console.log(`Retry ${retryCountRef.current}/2 loading statuses`);
        setTimeout(fetchStatuses, 2000);
        return;
      }
      
      const defaultStatuses: StatusCode[] = [
        'none', 'assistance', 'vigi', 'formation', 'projet', 
        'conges', 'management', 'tp', 'coordinateur', 'absence',
        'regisseur', 'demenagement', 'permanence', 'parc'
      ];
      setStatuses(defaultStatuses);
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("useStatusFetcher: Component unmount");
      isMounted.current = false;
      
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, []);

  return { statuses, isLoading, fetchStatuses };
}
