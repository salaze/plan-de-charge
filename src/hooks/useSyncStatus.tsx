
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
  
  // Using explicit typing to avoid recursion issues
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
      // Handle each table type explicitly to avoid TypeScript recursion
      let checkResult;
      
      if (table === "statuts") {
        checkResult = await supabase
          .from("statuts")
          .select(idField)
          .eq(idField, data[idField] as string)
          .maybeSingle();
      } else if (table === "employes") {
        checkResult = await supabase
          .from("employes")
          .select(idField)
          .eq(idField, data[idField] as string)
          .maybeSingle();
      } else if (table === "employe_schedule") {
        checkResult = await supabase
          .from("employe_schedule")
          .select(idField)
          .eq(idField, data[idField] as string)
          .maybeSingle();
      } else if (table === "Taches") {
        checkResult = await supabase
          .from("Taches")
          .select(idField)
          .eq(idField, data[idField] as string)
          .maybeSingle();
      } else {
        // connection_logs as fallback
        checkResult = await supabase
          .from("connection_logs")
          .select(idField)
          .eq(idField, data[idField] as string)
          .maybeSingle();
      }
      
      if (checkResult.error) throw checkResult.error;
      const existingData = checkResult.data;

      let result;

      if (existingData) {
        // Update existing record based on table type
        let updateResult;
        
        if (table === "statuts") {
          updateResult = await supabase
            .from("statuts")
            .update(data as Record<string, any>)
            .eq(idField, data[idField] as string)
            .select();
        } else if (table === "employes") {
          updateResult = await supabase
            .from("employes")
            .update(data as Record<string, any>)
            .eq(idField, data[idField] as string)
            .select();
        } else if (table === "employe_schedule") {
          updateResult = await supabase
            .from("employe_schedule")
            .update(data as Record<string, any>)
            .eq(idField, data[idField] as string)
            .select();
        } else if (table === "Taches") {
          updateResult = await supabase
            .from("Taches")
            .update(data as Record<string, any>)
            .eq(idField, data[idField] as string)
            .select();
        } else {
          updateResult = await supabase
            .from("connection_logs")
            .update(data as Record<string, any>)
            .eq(idField, data[idField] as string)
            .select();
        }
        
        if (updateResult.error) throw updateResult.error;
        result = updateResult.data;
      } else {
        // Create new record based on table type
        let insertResult;
        
        if (table === "statuts") {
          insertResult = await supabase
            .from("statuts")
            .insert(data as Record<string, any>)
            .select();
        } else if (table === "employes") {
          insertResult = await supabase
            .from("employes")
            .insert(data as Record<string, any>)
            .select();
        } else if (table === "employe_schedule") {
          insertResult = await supabase
            .from("employe_schedule")
            .insert(data as Record<string, any>)
            .select();
        } else if (table === "Taches") {
          insertResult = await supabase
            .from("Taches")
            .insert(data as Record<string, any>)
            .select();
        } else {
          insertResult = await supabase
            .from("connection_logs")
            .insert(data as Record<string, any>)
            .select();
        }
        
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
  
  // Fetch function with explicit table handling to avoid type recursion
  const fetchFromSupabase = useCallback(async (table: SupabaseTable) => {
    if (!isConnected) {
      console.error("Impossible de récupérer les données: pas de connexion à Supabase");
      return null;
    }
    
    setIsSyncing(true);
    
    try {
      let result;
      
      if (table === "statuts") {
        result = await supabase.from("statuts").select('*');
      } else if (table === "employes") {
        result = await supabase.from("employes").select('*');
      } else if (table === "employe_schedule") {
        result = await supabase.from("employe_schedule").select('*');
      } else if (table === "Taches") {
        result = await supabase.from("Taches").select('*');
      } else {
        result = await supabase.from("connection_logs").select('*');
      }
      
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
