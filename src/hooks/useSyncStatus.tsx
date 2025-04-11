
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function useSyncStatus() {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  
  // Define checkConnection function
  const checkConnection = useCallback(async () => {
    try {
      // Use a simpler query on a table we know exists
      const { data, error } = await supabase.from('statuts').select('id').limit(1);
      
      if (error) {
        console.error("Erreur de connexion à Supabase:", error);
        setIsConnected(false);
        return false;
      } else {
        setIsConnected(true);
        return true;
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de la connexion:", error);
      setIsConnected(false);
      return false;
    }
  }, []);
  
  // Vérifier la connexion au démarrage
  useEffect(() => {
    let isMounted = true;
    
    const checkInitialConnection = async () => {
      if (isMounted) {
        await checkConnection();
      }
    };
    
    checkInitialConnection();
    
    // Vérifier la connexion toutes les 30 secondes
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
  
  // Fonction pour synchroniser avec Supabase de manière sûre
  const syncWithSupabase = useCallback(async (data: any, table: string, idField: string = 'id') => {
    if (!isConnected) {
      toast.error("Impossible de synchroniser: pas de connexion à Supabase");
      return false;
    }
    
    setIsSyncing(true);
    
    try {
      // Utiliser as any pour contourner les restrictions TypeScript temporairement
      const { data: existingData, error: checkError } = await (supabase as any)
        .from(table)
        .select(idField)
        .eq(idField, data[idField])
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      let result;
      
      if (existingData) {
        // Mise à jour d'un enregistrement existant
        const { data: updatedData, error: updateError } = await (supabase as any)
          .from(table)
          .update(data)
          .eq(idField, data[idField])
          .select();
          
        if (updateError) throw updateError;
        result = updatedData;
      } else {
        // Création d'un nouvel enregistrement
        const { data: insertedData, error: insertError } = await (supabase as any)
          .from(table)
          .insert([data])
          .select();
          
        if (insertError) throw insertError;
        result = insertedData;
      }
      
      setLastSyncTime(new Date());
      return result;
    } catch (error) {
      console.error(`Erreur lors de la synchronisation avec Supabase (table ${table}):`, error);
      toast.error(`Erreur de synchronisation: ${(error as any).message || "Erreur inconnue"}`);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isConnected]);
  
  // Fonction pour récupérer des données depuis Supabase
  const fetchFromSupabase = useCallback(async (table: string, query = {}) => {
    if (!isConnected) {
      toast.error("Impossible de récupérer les données: pas de connexion à Supabase");
      return null;
    }
    
    setIsSyncing(true);
    
    try {
      const { data, error } = await (supabase as any)
        .from(table)
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setLastSyncTime(new Date());
      return data;
    } catch (error) {
      console.error(`Erreur lors de la récupération depuis Supabase (table ${table}):`, error);
      toast.error(`Erreur de récupération: ${(error as any).message || "Erreur inconnue"}`);
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

export default useSyncStatus;
