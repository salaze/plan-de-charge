
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
  
  // Properly typed sync function that avoids type inference issues
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
      // Use proper type assertion with "as const" to ensure correct typing
      const tableString = table as "statuts" | "employes" | "employe_schedule" | "Taches" | "connection_logs";
      
      // Check if record exists
      const checkResult = await supabase
        .from(tableString)
        .select(idField)
        .eq(idField, data[idField])
        .maybeSingle();
      
      if (checkResult.error) throw checkResult.error;
      const existingData = checkResult.data;

      let result;

      if (existingData) {
        // Update existing record
        const updateResult = await supabase
          .from(tableString)
          // Safe type assertion just for the update operation
          .update(data as Record<string, any>)
          .eq(idField, data[idField])
          .select();
        
        if (updateResult.error) throw updateResult.error;
        result = updateResult.data;
      } else {
        // Create new record
        const insertResult = await supabase
          .from(tableString)
          // Safe type assertion just for the insert operation
          .insert(data as Record<string, any>)
          .select();
        
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
  
  // Properly typed fetch function
  const fetchFromSupabase = useCallback(async (table: SupabaseTable) => {
    if (!isConnected) {
      console.error("Impossible de récupérer les données: pas de connexion à Supabase");
      return null;
    }
    
    setIsSyncing(true);
    
    try {
      // Use proper type assertion with "as const" to ensure correct typing
      const tableString = table as "statuts" | "employes" | "employe_schedule" | "Taches" | "connection_logs";
      
      const result = await supabase
        .from(tableString)
        .select('*');
      
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
