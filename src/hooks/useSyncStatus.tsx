
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { checkSupabaseTables } from '@/utils/initSupabase';
import { SupabaseTable } from '@/types/supabase';
import { syncTableData } from '@/services/syncService';
import { fetchFromTable } from '@/utils/supabaseHelpers';

export function useSyncStatus() {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [connectionCheckCount, setConnectionCheckCount] = useState(0);
  
  const checkConnection = useCallback(async () => {
    try {
      console.log("Vérification de la connexion Supabase (#" + (connectionCheckCount + 1) + ")");
      setConnectionCheckCount(prev => prev + 1);
      
      // Première approche: Essayer de vérifier toutes les tables
      const result = await checkSupabaseTables();
      
      if (result.success) {
        console.log("Connexion Supabase établie via checkSupabaseTables");
        setIsConnected(true);
        return true;
      }
      
      // Seconde approche: Essayer une requête simple sur la table statuts
      try {
        console.log("Tentative directe sur la table statuts...");
        const { data, error } = await supabase
          .from('statuts')
          .select('count(*)')
          .single();
        
        if (!error) {
          console.log("Connexion Supabase établie via requête simple sur statuts");
          setIsConnected(true);
          return true;
        }
      } catch (e) {
        console.warn("Échec de la requête simple sur statuts:", e);
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
  }, [connectionCheckCount]);
  
  useEffect(() => {
    let isMounted = true;
    
    const checkInitialConnection = async () => {
      if (isMounted) {
        await checkConnection();
      }
    };
    
    checkInitialConnection();
    
    const interval = setInterval(() => {
      if (isMounted) {
        checkConnection();
      }
    }, 60000); // Vérification toutes les minutes au lieu de toutes les 30 secondes
    
    return () => {
      isMounted = false;
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
