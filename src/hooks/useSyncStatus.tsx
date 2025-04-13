
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { checkSupabaseTables } from '@/utils/initSupabase';
import { SupabaseTable } from '@/types/supabase';
import { syncTableData } from '@/services/syncService';
import { fetchFromTable } from '@/utils/supabaseHelpers';
import { 
  checkSupabaseConnectionFast, 
  checkCompleteSupabaseConnection,
  ConnectionTestResult 
} from '@/utils/supabase/connection';

export function useSyncStatus() {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [connectionCheckCount, setConnectionCheckCount] = useState(0);
  const lastCheckTime = useRef<number>(0);
  const isCheckingRef = useRef<boolean>(false);
  const initialCheckDone = useRef<boolean>(false);
  // Augmenter l'intervalle à 30 minutes pour réduire les vérifications en arrière-plan
  const CHECK_INTERVAL = 1800000; // 30 minutes (increased from 5 minutes)
  const CHECK_DEBOUNCE = 10000; // 10 seconds minimum between checks (increased from 5 seconds)
  
  const checkConnection = useCallback(async () => {
    try {
      // Eviter les vérifications simultanées
      if (isCheckingRef.current) {
        console.log("Une vérification est déjà en cours, ignorée");
        return isConnected;
      }
      
      // Eviter les vérifications trop rapprochées
      const now = Date.now();
      if (now - lastCheckTime.current < CHECK_DEBOUNCE) {
        console.log("Vérification de connexion ignorée (trop rapprochée)");
        return isConnected;
      }
      
      isCheckingRef.current = true;
      lastCheckTime.current = now;
      console.log("Vérification de la connexion Supabase (#" + (connectionCheckCount + 1) + ")");
      setConnectionCheckCount(prev => prev + 1);
      
      // Utiliser un timeout pour éviter les blocages
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => reject(new Error("Timeout global de la vérification")), 5000);
      });
      
      try {
        // Première approche: test rapide optimisé
        const fastResult = await Promise.race([checkSupabaseConnectionFast(), timeoutPromise]);
        
        if (fastResult) {
          console.log("Connexion Supabase établie via test rapide");
          setIsConnected(true);
          isCheckingRef.current = false;
          return true;
        }
      } catch (e) {
        console.warn("Test rapide échoué:", e);
      }
      
      // Si le test rapide échoue, on considère que la connexion est perdue
      console.error("Échec du test de connexion");
      setIsConnected(false);
      isCheckingRef.current = false;
      return false;
      
    } catch (error) {
      console.error("Erreur lors de la vérification de la connexion:", error);
      setIsConnected(false);
      isCheckingRef.current = false;
      return false;
    }
  }, [connectionCheckCount, isConnected]);
  
  useEffect(() => {
    let isMounted = true;
    
    const checkInitialConnection = async () => {
      if (isMounted && isConnected === null && !initialCheckDone.current) {
        initialCheckDone.current = true; // Mark as done before the check to prevent multiple initial checks
        await checkConnection();
      }
    };
    
    // Initial check with a slight delay to avoid simultaneous checks
    const initialTimer = setTimeout(checkInitialConnection, 2500);
    
    // Désactiver la vérification périodique pour éviter les requêtes en boucle
    // La connexion sera vérifiée seulement lorsque nécessaire (sync ou fetch)
    
    return () => {
      isMounted = false;
      clearTimeout(initialTimer);
    };
  }, [checkConnection, isConnected]);
  
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
