
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { checkSupabaseTables } from '@/utils/initSupabase';
import { SupabaseTable } from '@/types/supabase';

// Define simple interface for the return type of sync functions
interface SyncResult {
  success: boolean;
  data?: any;
  error?: any;
}

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
  
  // Helper function to check if record exists and get it
  const checkRecordExists = async (table: string, idField: string, idValue: string) => {
    try {
      const { data, error } = await supabase
        .from(table)
        .select(idField)
        .eq(idField, idValue)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error checking if record exists in ${table}:`, error);
      return null;
    }
  };

  // Type guards for validating data
  const isValidStatut = (data: any): boolean => {
    return data && typeof data.code === 'string' && 
           typeof data.libelle === 'string' && 
           typeof data.couleur === 'string';
  };
  
  const isValidEmploye = (data: any): boolean => {
    return data && typeof data.nom === 'string';
  };
  
  const isValidSchedule = (data: any): boolean => {
    return data && typeof data.date === 'string' && 
           typeof data.period === 'string' && 
           typeof data.statut_code === 'string';
  };
  
  // Helper function for inserting records with validation
  const insertRecord = async (table: string, data: any): Promise<SyncResult> => {
    try {
      let result;
      
      switch (table) {
        case 'statuts': {
          if (!isValidStatut(data)) {
            return { 
              success: false, 
              error: new Error("Missing required fields for statuts table") 
            };
          }
          
          // Type-safe insertion for statuts
          const insertData = {
            code: data.code,
            libelle: data.libelle,
            couleur: data.couleur,
            display_order: data.display_order || 0,
            id: data.id
          };
          
          result = await supabase
            .from('statuts')
            .insert(insertData)
            .select();
          break;
        }
        case 'employes': {
          if (!isValidEmploye(data)) {
            return { 
              success: false, 
              error: new Error("Missing required fields for employes table") 
            };
          }
          
          // Type-safe insertion for employes
          const insertData = {
            id: data.id,
            nom: data.nom,
            prenom: data.prenom,
            departement: data.departement,
            fonction: data.fonction,
            role: data.role,
            uid: data.uid
          };
          
          result = await supabase
            .from('employes')
            .insert(insertData)
            .select();
          break;
        }
        case 'employe_schedule': {
          if (!isValidSchedule(data)) {
            return { 
              success: false, 
              error: new Error("Missing required fields for employe_schedule table") 
            };
          }
          
          // Type-safe insertion for employe_schedule
          const insertData = {
            id: data.id,
            employe_id: data.employe_id,
            date: data.date,
            period: data.period,
            statut_code: data.statut_code,
            project_code: data.project_code,
            is_highlighted: data.is_highlighted,
            note: data.note
          };
          
          result = await supabase
            .from('employe_schedule')
            .insert(insertData)
            .select();
          break;
        }
        case 'Taches': {
          const insertData = {
            id: data.id,
            created_at: data.created_at
          };
          
          result = await supabase
            .from('Taches')
            .insert(insertData)
            .select();
          break;
        }
        case 'connection_logs': {
          const insertData = {
            id: data.id,
            event_type: data.event_type,
            user_id: data.user_id,
            user_name: data.user_name,
            ip_address: data.ip_address,
            user_agent: data.user_agent
          };
          
          result = await supabase
            .from('connection_logs')
            .insert(insertData)
            .select();
          break;
        }
        default:
          return {
            success: false,
            error: new Error(`Unsupported table: ${table}`)
          };
      }
      
      if (result?.error) throw result.error;
      return { success: true, data: result?.data };
    } catch (error) {
      console.error(`Error inserting record into ${table}:`, error);
      return { success: false, error };
    }
  };
  
  // Helper function for updating records with proper typing
  const updateRecord = async (table: string, idField: string, idValue: string, data: any): Promise<SyncResult> => {
    try {
      let result;
      
      switch (table) {
        case 'statuts': {
          // Create update object only with fields that exist
          const updateData: Record<string, any> = {};
          if (data.code !== undefined) updateData.code = data.code;
          if (data.libelle !== undefined) updateData.libelle = data.libelle;
          if (data.couleur !== undefined) updateData.couleur = data.couleur;
          if (data.display_order !== undefined) updateData.display_order = data.display_order;
          
          result = await supabase
            .from('statuts')
            .update(updateData)
            .eq(idField, idValue)
            .select();
          break;
        }
        case 'employes': {
          // Create update object only with fields that exist
          const updateData: Record<string, any> = {};
          if (data.nom !== undefined) updateData.nom = data.nom;
          if (data.prenom !== undefined) updateData.prenom = data.prenom;
          if (data.departement !== undefined) updateData.departement = data.departement;
          if (data.fonction !== undefined) updateData.fonction = data.fonction;
          if (data.role !== undefined) updateData.role = data.role;
          if (data.uid !== undefined) updateData.uid = data.uid;
          
          result = await supabase
            .from('employes')
            .update(updateData)
            .eq(idField, idValue)
            .select();
          break;
        }
        case 'employe_schedule': {
          // Create update object only with fields that exist
          const updateData: Record<string, any> = {};
          if (data.employe_id !== undefined) updateData.employe_id = data.employe_id;
          if (data.date !== undefined) updateData.date = data.date;
          if (data.period !== undefined) updateData.period = data.period;
          if (data.statut_code !== undefined) updateData.statut_code = data.statut_code;
          if (data.project_code !== undefined) updateData.project_code = data.project_code;
          if (data.is_highlighted !== undefined) updateData.is_highlighted = data.is_highlighted;
          if (data.note !== undefined) updateData.note = data.note;
          
          result = await supabase
            .from('employe_schedule')
            .update(updateData)
            .eq(idField, idValue)
            .select();
          break;
        }
        case 'Taches': {
          result = await supabase
            .from('Taches')
            .update({
              created_at: data.created_at
            })
            .eq(idField, idValue)
            .select();
          break;
        }
        case 'connection_logs': {
          const updateData: Record<string, any> = {};
          if (data.event_type !== undefined) updateData.event_type = data.event_type;
          if (data.user_id !== undefined) updateData.user_id = data.user_id;
          if (data.user_name !== undefined) updateData.user_name = data.user_name;
          if (data.ip_address !== undefined) updateData.ip_address = data.ip_address;
          if (data.user_agent !== undefined) updateData.user_agent = data.user_agent;
          
          result = await supabase
            .from('connection_logs')
            .update(updateData)
            .eq(idField, idValue)
            .select();
          break;
        }
        default:
          return {
            success: false,
            error: new Error(`Unsupported table: ${table}`)
          };
      }
      
      if (result?.error) throw result.error;
      return { success: true, data: result?.data };
    } catch (error) {
      console.error(`Error updating record in ${table}:`, error);
      return { success: false, error };
    }
  };
  
  // Main syncWithSupabase function
  const syncWithSupabase = useCallback(async (
    data: Record<string, any>,
    table: string,
    idField: string = 'id'
  ) => {
    if (!isConnected) {
      console.error("Impossible de synchroniser: pas de connexion à Supabase");
      return false;
    }

    setIsSyncing(true);

    try {
      const idValue = data[idField] as string;
      if (!idValue) {
        throw new Error(`Missing ID field ${idField}`);
      }
      
      // Check if record exists
      const existingData = await checkRecordExists(table, idField, idValue);
      
      let result;
      
      if (existingData) {
        // Update existing record
        result = await updateRecord(table, idField, idValue, data);
      } else {
        // Create new record
        result = await insertRecord(table, data);
      }

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
  
  // Fetch function with explicit table handling
  const fetchFromSupabase = useCallback(async (table: string) => {
    if (!isConnected) {
      console.error("Impossible de récupérer les données: pas de connexion à Supabase");
      return null;
    }
    
    setIsSyncing(true);
    
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*');
      
      if (error) throw error;
      
      setLastSyncTime(new Date());
      return data || null;
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
