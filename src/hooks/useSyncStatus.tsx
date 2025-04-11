
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
      
      // Avoid using maybeSingle() which can trigger type recursion
      // Instead, use simpler query approach
      const checkResponse = await supabase
        .from(table)
        .select(idField)
        .eq(idField, idString);
        
      if (checkResponse.error) throw checkResponse.error;
      
      // Check if any data returned instead of using maybeSingle()
      const existingData = checkResponse.data && checkResponse.data.length > 0 
        ? checkResponse.data[0] 
        : null;
        
      let result;
      
      if (existingData) {
        // Update existing record with a simpler approach
        const updateResponse = await supabase
          .from(table)
          .update(data)
          .eq(idField, idString);
          
        if (updateResponse.error) throw updateResponse.error;
        result = updateResponse.data;
      } else {
        // Create new record with a simpler approach
        const insertResponse = await supabase
          .from(table)
          .insert(data);
          
        if (insertResponse.error) throw insertResponse.error;
        result = insertResponse.data;
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
  
  // Define fetchFromSupabase with appropriate typing
  const fetchFromSupabase = useCallback(async (table: SupabaseTable) => {
    if (!isConnected) {
      console.error("Impossible de récupérer les données: pas de connexion à Supabase");
      return null;
    }
    
    setIsSyncing(true);
    
    try {
      // Use a simpler approach avoiding complex type instantiation
      const response = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false });
        
      if (response.error) throw response.error;
      
      setLastSyncTime(new Date());
      return response.data;
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
