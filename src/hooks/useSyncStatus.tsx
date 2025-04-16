
import { useState, useRef, useCallback } from 'react';
import { checkSupabaseConnectionFast } from '@/utils/supabase/connection';
import { fetchFromTable } from '@/utils/supabaseHelpers';
import { SupabaseTable } from '@/types/supabase';

export function useSyncStatus() {
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const isCheckingRef = useRef<boolean>(false);
  const lastCheckTime = useRef<number>(0);
  
  const checkConnection = useCallback(async () => {
    try {
      // Avoid simultaneous checks
      if (isCheckingRef.current) {
        return isConnected;
      }
      
      isCheckingRef.current = true;
      
      // Use the fast connection check
      const connected = await checkSupabaseConnectionFast();
      
      setIsConnected(connected);
      if (connected) {
        setLastSyncTime(new Date());
      }
      
      isCheckingRef.current = false;
      return connected;
    } catch (error) {
      console.error("Erreur lors de la vérification de la connexion:", error);
      setIsConnected(false);
      isCheckingRef.current = false;
      return false;
    }
  }, [isConnected]);
  
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
  
  // Add the missing fetchFromSupabase function
  const fetchFromSupabase = useCallback(async (table: SupabaseTable) => {
    try {
      // Check connection first
      if (isConnected === null) {
        const connected = await checkConnection();
        if (!connected) return null;
      } else if (!isConnected) {
        return null;
      }
      
      // Fetch data from the specified table
      const data = await fetchFromTable(table);
      
      // Update last sync time if successful
      if (data) {
        setLastSyncTime(new Date());
      }
      
      return data;
    } catch (error) {
      console.error(`Erreur lors de la récupération depuis ${table}:`, error);
      return null;
    }
  }, [isConnected, checkConnection]);
  
  return {
    isSyncing,
    lastSyncTime,
    isConnected,
    syncWithSupabase,
    fetchFromSupabase,
    checkConnection
  };
}
