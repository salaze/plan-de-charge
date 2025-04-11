
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function useSyncStatus() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  
  // Vérifier la connexion au démarrage
  useEffect(() => {
    checkConnection();
    
    // Vérifier la connexion toutes les 30 secondes
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const checkConnection = async () => {
    try {
      const { data, error } = await supabase.from('statuts').select('id').limit(1);
      
      if (error) {
        setIsConnected(false);
        console.error("Erreur de connexion à Supabase:", error);
      } else {
        setIsConnected(true);
      }
    } catch (error) {
      setIsConnected(false);
      console.error("Erreur lors de la vérification de la connexion:", error);
    }
  };
  
  // Fonction pour forcer une synchronisation manuelle
  const syncWithSupabase = async (data: any, table: string, idField: string = 'id') => {
    if (!isConnected) {
      toast.error("Impossible de synchroniser: pas de connexion à Supabase");
      return false;
    }
    
    setIsSyncing(true);
    
    try {
      // Vérifier si l'enregistrement existe déjà
      const { data: existingData, error: checkError } = await supabase
        .from(table)
        .select(idField)
        .eq(idField, data[idField])
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      let result;
      
      if (existingData) {
        // Mise à jour d'un enregistrement existant
        const { data: updatedData, error: updateError } = await supabase
          .from(table)
          .update(data)
          .eq(idField, data[idField])
          .select();
          
        if (updateError) throw updateError;
        result = updatedData;
        toast.success(`Enregistrement mis à jour dans Supabase`);
      } else {
        // Création d'un nouvel enregistrement
        const { data: insertedData, error: insertError } = await supabase
          .from(table)
          .insert([data])
          .select();
          
        if (insertError) throw insertError;
        result = insertedData;
        toast.success(`Nouvel enregistrement ajouté dans Supabase`);
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
  };
  
  // Fonction pour récupérer des données depuis Supabase
  const fetchFromSupabase = async (table: string, query = {}) => {
    if (!isConnected) {
      toast.error("Impossible de récupérer les données: pas de connexion à Supabase");
      return null;
    }
    
    setIsSyncing(true);
    
    try {
      const { data, error } = await supabase
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
  };
  
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
