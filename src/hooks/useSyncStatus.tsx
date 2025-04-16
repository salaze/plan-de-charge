
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { checkSupabaseTables } from '@/utils/initSupabase';
import { SupabaseTable } from '@/types/supabase';
import { syncTableData } from '@/services/syncService';
import { fetchFromTable } from '@/utils/supabaseHelpers';
import { checkSupabaseConnectionFast } from '@/utils/supabase/connection';

export function useSyncStatus() {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [connectionCheckCount, setConnectionCheckCount] = useState(0);
  const lastCheckTime = useRef<number>(0);
  const isCheckingRef = useRef<boolean>(false);
  const connectionChecked = useRef<boolean>(false);
  
  // Intervalles de vérification plus longs pour éviter les boucles
  const CHECK_DEBOUNCE = 30000; // 30 secondes minimum entre les vérifications
  
  const checkConnection = useCallback(async () => {
    try {
      // Éviter les vérifications simultanées
      if (isCheckingRef.current) {
        console.log("Une vérification est déjà en cours, ignorée");
        return isConnected;
      }
      
      // Éviter les vérifications trop rapprochées
      const now = Date.now();
      if (now - lastCheckTime.current < CHECK_DEBOUNCE) {
        console.log("Vérification de connexion ignorée (trop rapprochée)");
        return isConnected;
      }
      
      isCheckingRef.current = true;
      lastCheckTime.current = now;
      console.log("Vérification de la connexion Supabase (#" + (connectionCheckCount + 1) + ")");
      setConnectionCheckCount(prev => prev + 1);
      connectionChecked.current = true;
      
      // Test rapide optimisé
      try {
        const isConnected = await checkSupabaseConnectionFast();
        
        if (isConnected) {
          console.log("Connexion Supabase établie");
          setIsConnected(true);
          isCheckingRef.current = false;
          return true;
        }
      } catch (e) {
        console.warn("Échec du test de connexion:", e);
      }
      
      // Si le test échoue, on considère que la connexion est perdue
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
  
  // Une seule vérification initiale à l'initialisation du hook, seulement si explicitement demandé
  useEffect(() => {
    // Le hook est initialisé, mais on ne lance pas automatiquement la vérification
    // Cette vérification sera lancée par l'utilisateur ou lors d'une opération de synchronisation
    return () => {
      // Nettoyage
    };
  }, []);
  
  const syncWithSupabase = useCallback(async (
    data: Record<string, any>,
    table: SupabaseTable,
    idField: string = 'id'
  ) => {
    // Si la connexion n'est pas établie, tenter une vérification
    if (isConnected === null) {
      const connectionTest = await checkConnection();
      if (!connectionTest) {
        console.error("Impossible de synchroniser: pas de connexion à Supabase");
        return false;
      }
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
  }, [isConnected, checkConnection]);
  
  const fetchFromSupabase = useCallback(async (table: SupabaseTable) => {
    // Vérifier la connexion si nécessaire
    if (isConnected === null) {
      const connectionTest = await checkConnection();
      if (!connectionTest) {
        console.error("Impossible de récupérer les données: pas de connexion à Supabase");
        return null;
      }
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
  }, [isConnected, checkConnection]);
  
  return {
    isSyncing,
    lastSyncTime,
    isConnected,
    syncWithSupabase,
    fetchFromSupabase,
    checkConnection
  };
}
