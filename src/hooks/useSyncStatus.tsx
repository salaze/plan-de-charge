
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
  
  // Simplified function with explicit types to avoid TypeScript recursion issues
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
      // Extract id safely
      const id = data[idField];
      const idString = id ? String(id) : '';
      
      // Use the most basic possible approach to avoid type recursion
      let result;
      
      // First check if the record exists
      const { data: checkData, error: checkError } = await supabase
        .from(table)
        .select(idField)
        .eq(idField, idString);
      
      if (checkError) throw checkError;
      
      const recordExists = checkData && checkData.length > 0;
      
      if (recordExists) {
        // Update existing record
        const { error: updateError } = await supabase
          .from(table)
          .update(data)
          .eq(idField, idString);
          
        if (updateError) throw updateError;
      } else {
        // Create new record
        const { error: insertError } = await supabase
          .from(table)
          .insert(data);
          
        if (insertError) throw insertError;
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
  
  // Define fetchFromSupabase with appropriate typing
  const fetchFromSupabase = useCallback(async (table: SupabaseTable) => {
    if (!isConnected) {
      console.error("Impossible de récupérer les données: pas de connexion à Supabase");
      return null;
    }
    
    setIsSyncing(true);
    
    try {
      // Use the most basic approach to avoid type recursion
      const { data, error } = await supabase
        .from(table)
        .select('*');
      
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
