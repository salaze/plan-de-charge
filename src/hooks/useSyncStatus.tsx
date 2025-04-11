
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
  
  // Completely rewritten with explicit any typing to avoid TypeScript recursion issues
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
      
      // Use explicit any type to avoid TypeScript recursion
      const query = supabase
        .from(table)
        .select(idField)
        .eq(idField, idString);
        
      // Use explicit type casting to avoid type recursion
      const checkResult = await query as any;
      const checkError = checkResult.error;
      const checkData = checkResult.data;
      
      if (checkError) throw checkError;
      
      const recordExists = checkData && checkData.length > 0;
      
      if (recordExists) {
        // Explicitly type cast to avoid recursion
        const updateQuery = supabase
          .from(table)
          .update(data)
          .eq(idField, idString);
        
        const updateResult = await updateQuery as any;
        if (updateResult.error) throw updateResult.error;
      } else {
        // Explicitly type cast to avoid recursion
        const insertQuery = supabase
          .from(table)
          .insert(data);
        
        const insertResult = await insertQuery as any;
        if (insertResult.error) throw insertResult.error;
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
  
  // Completely rewritten fetch function with explicit typing to avoid recursion
  const fetchFromSupabase = useCallback(async (table: SupabaseTable) => {
    if (!isConnected) {
      console.error("Impossible de récupérer les données: pas de connexion à Supabase");
      return null;
    }
    
    setIsSyncing(true);
    
    try {
      // Use explicit any type to avoid TypeScript recursion
      const query = supabase.from(table).select('*');
      const result = await query as any;
      
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
