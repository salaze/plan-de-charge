
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
  
  // Completely rewritten with simplest possible typing to avoid TypeScript recursion
  const syncWithSupabase = useCallback(async (
    data: Record<string, unknown>,
    table: SupabaseTable,
    idField: string = 'id'
  ): Promise<boolean> => {
    if (!isConnected) {
      console.error("Impossible de synchroniser: pas de connexion à Supabase");
      return false;
    }
    
    setIsSyncing(true);
    
    try {
      // Extract id safely
      const id = data[idField];
      const idString = id ? String(id) : '';
      
      // Avoid destructuring and complex type inference
      // Create the query without awaiting first
      const query = supabase
        .from(table)
        .select(idField)
        .eq(idField, idString);
      
      // Execute and handle results as unknown type first
      const rawResult = await query;
      
      // Type assertions after receiving results
      const checkData = rawResult.data || [];
      const checkError = rawResult.error;
      
      if (checkError) throw checkError;
      
      const recordExists = checkData.length > 0;
      
      if (recordExists) {
        // Update existing record without immediate destructuring
        const updateQuery = supabase
          .from(table)
          .update(data)
          .eq(idField, idString);
          
        const updateRaw = await updateQuery;
        if (updateRaw.error) throw updateRaw.error;
      } else {
        // Insert new record without immediate destructuring
        const insertQuery = supabase
          .from(table)
          .insert(data);
          
        const insertRaw = await insertQuery;
        if (insertRaw.error) throw insertRaw.error;
      }
      
      setLastSyncTime(new Date());
      return true;
    } catch (error) {
      console.error(`Erreur lors de la synchronisation avec Supabase (table ${table}):`, error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isConnected]);
  
  // Simplified fetch function with minimal typing to avoid recursion
  const fetchFromSupabase = useCallback(async (table: SupabaseTable) => {
    if (!isConnected) {
      console.error("Impossible de récupérer les données: pas de connexion à Supabase");
      return null;
    }
    
    setIsSyncing(true);
    
    try {
      // Create query without immediate awaiting
      const query = supabase
        .from(table)
        .select('*');
      
      // Execute and handle as unknown first
      const rawResult = await query;
      const data = rawResult.data;
      const error = rawResult.error;
      
      if (error) throw error;
      
      setLastSyncTime(new Date());
      return data;
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
