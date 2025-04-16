
import { useState, useRef, useCallback, useEffect } from 'react';
import { checkSupabaseConnectionFast } from '@/utils/supabase/connection';
import { fetchFromTable } from '@/utils/supabaseHelpers';
import { SupabaseTable } from '@/types/supabase';
import { toast } from 'sonner';

// Cache duration in milliseconds
const CONNECTION_CACHE_DURATION = 30000; // 30 seconds
const AUTO_CHECK_INTERVAL = 60000; // 1 minute

// Custom event for connection status changes
export const CONNECTION_STATUS_EVENT = 'supabase-connection-status-change';

export function useSyncStatus() {
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const isCheckingRef = useRef<boolean>(false);
  const lastCheckTime = useRef<number>(0);
  const checkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef<number>(0);
  const MAX_RETRIES = 3;
  
  // Function to emit connection status change events
  const emitConnectionStatusChange = useCallback((status: boolean) => {
    try {
      const event = new CustomEvent(CONNECTION_STATUS_EVENT, { 
        detail: { connected: status, time: new Date() } 
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error("Erreur lors de l'émission de l'événement de connexion:", error);
    }
  }, []);
  
  // Clear any existing timeout to prevent memory leaks
  const clearCheckTimeout = useCallback(() => {
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
      checkTimeoutRef.current = null;
    }
  }, []);
  
  // Check connection with retry mechanism
  const checkConnection = useCallback(async (force = false): Promise<boolean> => {
    // Use cached result if recent and not forced
    const now = Date.now();
    if (!force && 
        isConnected !== null && 
        now - lastCheckTime.current < CONNECTION_CACHE_DURATION) {
      console.log("Utilisation du cache de statut de connexion:", isConnected);
      return isConnected;
    }
    
    // Avoid simultaneous checks
    if (isCheckingRef.current) {
      console.log("Vérification déjà en cours, attente...");
      return isConnected !== null ? isConnected : false;
    }
    
    try {
      isCheckingRef.current = true;
      retryCountRef.current = 0;
      
      // Implement retry logic
      const tryConnection = async (): Promise<boolean> => {
        try {
          console.log(`Tentative de connexion ${retryCountRef.current + 1}/${MAX_RETRIES + 1}...`);
          const connected = await checkSupabaseConnectionFast();
          
          if (connected) {
            retryCountRef.current = 0;
            return true;
          } else if (retryCountRef.current < MAX_RETRIES) {
            retryCountRef.current++;
            // Exponential backoff: 500ms, 1000ms, 2000ms
            const delay = Math.min(500 * Math.pow(2, retryCountRef.current - 1), 2000);
            console.log(`Nouvelle tentative dans ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return tryConnection();
          }
          return false;
        } catch (error) {
          console.error("Erreur lors de la vérification de connexion:", error);
          if (retryCountRef.current < MAX_RETRIES) {
            retryCountRef.current++;
            await new Promise(resolve => setTimeout(resolve, 1000));
            return tryConnection();
          }
          return false;
        }
      };
      
      const connected = await tryConnection();
      
      // Update state only if there's a change to avoid unnecessary rerenders
      if (connected !== isConnected) {
        setIsConnected(connected);
        emitConnectionStatusChange(connected);
        
        if (connected) {
          setLastSyncTime(new Date());
          if (isConnected === false) {
            // Connection restored
            toast.success("Connexion à Supabase rétablie");
          }
        } else if (isConnected === true) {
          // Connection lost
          toast.error("Connexion à Supabase perdue");
        }
      }
      
      // Update lastCheckTime regardless of result
      lastCheckTime.current = Date.now();
      isCheckingRef.current = false;
      return connected;
    } catch (error) {
      console.error("Exception lors de la vérification de connexion:", error);
      setIsConnected(false);
      emitConnectionStatusChange(false);
      isCheckingRef.current = false;
      
      // Update lastCheckTime even on error to prevent immediate retries
      lastCheckTime.current = Date.now();
      return false;
    }
  }, [isConnected, emitConnectionStatusChange]);
  
  // Sync data with Supabase with improved error handling
  const syncWithSupabase = useCallback(async (data: any, table: string) => {
    setIsSyncing(true);
    
    try {
      // Check connection if needed
      if (isConnected === null) {
        await checkConnection();
      }
      
      // If we have a connection, we would perform the sync operation here
      // For now we just update the sync time
      if (isConnected) {
        setLastSyncTime(new Date());
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Erreur lors de la synchronisation:", error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isConnected, checkConnection]);
  
  // Fetch data from Supabase with improved error handling
  const fetchFromSupabase = useCallback(async (table: SupabaseTable) => {
    try {
      // Check connection first
      if (isConnected === null) {
        const connected = await checkConnection();
        if (!connected) {
          toast.error(`Impossible de se connecter à Supabase pour récupérer ${table}`);
          return null;
        }
      } else if (!isConnected) {
        toast.error(`Non connecté à Supabase, impossible de récupérer ${table}`);
        return null;
      }
      
      // Fetch data from the specified table
      console.log(`Récupération des données depuis ${table}...`);
      const data = await fetchFromTable(table);
      
      // Update last sync time if successful
      if (data) {
        setLastSyncTime(new Date());
        return data;
      } else {
        toast.error(`Aucune donnée récupérée depuis ${table}`);
        return null;
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération depuis ${table}:`, error);
      toast.error(`Erreur lors de la récupération des données depuis ${table}`);
      return null;
    }
  }, [isConnected, checkConnection]);
  
  // Set up automatic periodic connection check
  useEffect(() => {
    // Check connection on mount
    checkConnection();
    
    // Set up interval for periodic checks
    const intervalId = setInterval(() => {
      checkConnection(true);
    }, AUTO_CHECK_INTERVAL);
    
    // Clean up
    return () => {
      clearInterval(intervalId);
      clearCheckTimeout();
    };
  }, [checkConnection, clearCheckTimeout]);
  
  return {
    isSyncing,
    lastSyncTime,
    isConnected,
    syncWithSupabase,
    fetchFromSupabase,
    checkConnection
  };
}
