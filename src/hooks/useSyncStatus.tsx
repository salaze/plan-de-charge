
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { checkSupabaseTables } from '@/utils/initSupabase';
import { SupabaseTable } from '@/types/supabase';
import { syncTableData } from '@/services/syncService';
import { fetchFromTable } from '@/utils/supabaseHelpers';
import { checkSupabaseConnectionFast } from '@/utils/supabase/connectionChecker';

export function useSyncStatus() {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [connectionCheckCount, setConnectionCheckCount] = useState(0);
  const lastCheckTime = useRef<number>(0);
  const CHECK_INTERVAL = 60000; // 1 minute
  
  const checkConnection = useCallback(async () => {
    try {
      // Avoid multiple quick checks
      const now = Date.now();
      if (now - lastCheckTime.current < 1000) {
        console.log("Vérification de connexion ignorée (trop rapprochée)");
        return isConnected;
      }
      
      lastCheckTime.current = now;
      console.log("Vérification de la connexion Supabase (#" + (connectionCheckCount + 1) + ")");
      setConnectionCheckCount(prev => prev + 1);
      
      // Première approche: test rapide optimisé
      const fastResult = await checkSupabaseConnectionFast();
      
      if (fastResult) {
        console.log("Connexion Supabase établie via test rapide");
        setIsConnected(true);
        return true;
      }
      
      // Seconde approche: Essayer de vérifier les tables
      const result = await checkSupabaseTables();
      
      if (result.success) {
        console.log("Connexion Supabase établie via checkSupabaseTables");
        setIsConnected(true);
        return true;
      }
      
      // Si tout échoue, marquer comme non connecté
      console.error("Échec de toutes les tentatives de connexion");
      setIsConnected(false);
      return false;
    } catch (error) {
      console.error("Erreur lors de la vérification de la connexion:", error);
      setIsConnected(false);
      return false;
    }
  }, [connectionCheckCount, isConnected]);
  
  useEffect(() => {
    let isMounted = true;
    
    const checkInitialConnection = async () => {
      if (isMounted) {
        await checkConnection();
      }
    };
    
    // Initial check with a slight delay
    const initialTimer = setTimeout(checkInitialConnection, 500);
    
    // Periodic check 
    const interval = setInterval(() => {
      if (isMounted) {
        checkConnection();
      }
    }, CHECK_INTERVAL);
    
    return () => {
      isMounted = false;
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [checkConnection]);
  
  const syncWithSupabase = useCallback(async (
    data: Record<string, any>,
    table: SupabaseTable,
    idField: string = 'id'
  ) => {
    if (!isConnected) {
      console.error("Impossible de synchroniser: pas de connexion à Supabase");
      return false;
    }

    setIsSyncing(true);

    try {
      const result = await syncTableData(data, table, idField);

      if (result.success) {
        setLastSyncTime(new Date());
      }
      
      return result.data || result.success;
    } catch (error) {
      console.error(`Erreur lors de la synchronisation avec Supabase (table ${table}):`, error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isConnected]);
  
  const fetchFromSupabase = useCallback(async (table: SupabaseTable) => {
    if (!isConnected) {
      console.error("Impossible de récupérer les données: pas de connexion à Supabase");
      return null;
    }
    
    setIsSyncing(true);
    
    try {
      const data = await fetchFromTable(table);
      
      if (data) {
        setLastSyncTime(new Date());
      }
      
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
