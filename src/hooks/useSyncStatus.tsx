
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { checkSupabaseTables } from '@/utils/initSupabase';
import { SupabaseTable } from '@/types/supabase';

// Define table-specific interfaces with required fields explicitly marked
interface StatutData {
  id: string;
  code: string; // Required field
  libelle: string; // Required field
  couleur: string; // Required field
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

interface EmployeData {
  id: string;
  nom: string; // Required field
  prenom?: string;
  departement?: string;
  fonction?: string;
  role?: string;
  uid?: string;
  created_at?: string;
  updated_at?: string;
}

interface ScheduleData {
  id: string;
  employe_id: string;
  date: string; // Required field
  period: string; // Required field
  statut_code: string; // Required field
  project_code?: string;
  is_highlighted?: boolean;
  note?: string;
  created_at?: string;
}

interface TacheData {
  id: number;
  created_at: string;
}

interface ConnectionLogData {
  id: string;
  user_agent?: string;
  created_at: string;
  event_type?: string;
  user_id?: string;
  user_name?: string;
  ip_address?: string;
}

// Direct mapping type to help with type checking
type TableDataMap = {
  'statuts': StatutData;
  'employes': EmployeData;
  'employe_schedule': ScheduleData;
  'Taches': TacheData;
  'connection_logs': ConnectionLogData;
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
  const checkRecordExists = async <T extends SupabaseTable>(table: T, idField: string, idValue: string) => {
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
  
  // Helper function for inserting records with proper typing
  const insertRecord = async <T extends SupabaseTable>(table: T, data: any) => {
    try {
      let result;
      
      switch (table) {
        case 'statuts': {
          // Validate required fields
          if (!data.code || !data.libelle || !data.couleur) {
            throw new Error("Missing required fields for statuts table");
          }
          
          // Type-safe insertion for statuts
          const insertData = {
            id: data.id,
            code: data.code,
            libelle: data.libelle,
            couleur: data.couleur,
            display_order: data.display_order
          };
          
          result = await supabase
            .from('statuts')
            .insert(insertData)
            .select();
          break;
        }
        case 'employes': {
          // Validate required fields
          if (!data.nom) {
            throw new Error("Missing required fields for employes table");
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
          // Validate required fields
          if (!data.date || !data.period || !data.statut_code) {
            throw new Error("Missing required fields for employe_schedule table");
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
      }
      
      if (result?.error) throw result.error;
      return result?.data;
    } catch (error) {
      console.error(`Error inserting record into ${table}:`, error);
      return null;
    }
  };
  
  // Helper function for updating records with proper typing
  const updateRecord = async <T extends SupabaseTable>(table: T, idField: string, idValue: string, data: any) => {
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
      }
      
      if (result?.error) throw result.error;
      return result?.data;
    } catch (error) {
      console.error(`Error updating record in ${table}:`, error);
      return null;
    }
  };
  
  // Main syncWithSupabase function
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

      setLastSyncTime(new Date());
      return result;
    } catch (error) {
      console.error(`Erreur lors de la synchronisation avec Supabase (table ${table}):`, error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isConnected]);
  
  // Fetch function with explicit table handling
  const fetchFromSupabase = useCallback(async (table: SupabaseTable) => {
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
