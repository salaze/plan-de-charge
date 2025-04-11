
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { checkSupabaseTables } from '@/utils/initSupabase';
import { SupabaseTable } from '@/types/supabase';

export function useSyncStatus() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  
  // Define checkConnection function
  const checkConnection = useCallback(async () => {
    try {
      const connected = await checkSupabaseTables();
      setIsConnected(connected);
      return connected;
    } catch (error) {
      console.error("Erreur lors de la vérification de la connexion:", error);
      setIsConnected(false);
      return false;
    }
  }, []);
  
  // Check connection on component mount
  useEffect(() => {
    let isMounted = true;
    
    const checkInitialConnection = async () => {
      if (isMounted) {
        await checkConnection();
      }
    };
    
    checkInitialConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(() => {
      if (isMounted) {
        checkConnection();
      }
    }, 30000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [checkConnection]);
  
  // Simplified sync function to avoid TypeScript recursion issues
  const syncWithSupabase = useCallback(async (
    data: Record<string, unknown>,
    table: SupabaseTable,
    idField: string = 'id'
  ) => {
    if (!isConnected) {
      console.error("Impossible de synchroniser: pas de connexion à Supabase");
      return false;
    }

    setIsSyncing(true);

    try {
      // Type assertion to avoid TypeScript recursion
      const tableRef = supabase.from(table as string);
      
      // Check if record exists - done in steps to avoid complex type inference
      let checkQuery = tableRef.select(idField);
      checkQuery = checkQuery.eq(idField, data[idField]);
      const checkResult = await checkQuery.maybeSingle();
      
      if (checkResult.error) throw checkResult.error;
      const existingData = checkResult.data;

      let result;

      if (existingData) {
        // Update existing record - split into steps
        let updateQuery = tableRef.update(data as any);
        updateQuery = updateQuery.eq(idField, data[idField]);
        const updateResult = await updateQuery.select();
        
        if (updateResult.error) throw updateResult.error;
        result = updateResult.data;
      } else {
        // Create new record - split into steps
        const insertQuery = tableRef.insert(data as any);
        const insertResult = await insertQuery.select();
        
        if (insertResult.error) throw insertResult.error;
        result = insertResult.data;
      }

      setLastSyncTime(new Date());
      return result;
    } catch (error) {
      console.error(`Erreur lors de la synchronisation avec Supabase (table ${table}):`, error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isConnected]);
  
  // Fetch function with simplified typing to avoid recursion
  const fetchFromSupabase = useCallback(async (table: SupabaseTable) => {
    if (!isConnected) {
      console.error("Impossible de récupérer les données: pas de connexion à Supabase");
      return null;
    }
    
    setIsSyncing(true);
    
    try {
      // Type assertion to avoid TypeScript recursion
      const tableRef = supabase.from(table as string);
      const result = await tableRef.select('*');
      
      if (result.error) throw result.error;
      
      setLastSyncTime(new Date());
      return result.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération depuis Supabase (table ${table}):`, error);
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, [isConnected]);
  
  return {
    isSyncing,
    lastSyncTime,
    isConnected,
    syncWithSupabase,
    fetchFromSupabase,
    checkConnection
  };
}
