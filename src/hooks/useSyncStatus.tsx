
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { checkSupabaseTables } from '@/utils/initSupabase';
import { SupabaseTable } from '@/types/supabase';

// Define table-specific type interfaces to avoid recursion issues
interface StatutData {
  id: string;
  code: string;
  libelle: string;
  couleur: string;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

interface EmployeData {
  id: string;
  nom: string;
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
  date: string;
  period: string;
  statut_code: string;
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
  const checkRecordExists = async (table: SupabaseTable, idField: string, idValue: string) => {
    try {
      let query;
      
      switch (table) {
        case "statuts":
          query = await supabase.from("statuts").select(idField).eq(idField, idValue).maybeSingle();
          break;
        case "employes":
          query = await supabase.from("employes").select(idField).eq(idField, idValue).maybeSingle();
          break;
        case "employe_schedule":
          query = await supabase.from("employe_schedule").select(idField).eq(idField, idValue).maybeSingle();
          break;
        case "Taches":
          query = await supabase.from("Taches").select(idField).eq(idField, idValue).maybeSingle();
          break;
        case "connection_logs":
          query = await supabase.from("connection_logs").select(idField).eq(idField, idValue).maybeSingle();
          break;
      }
      
      if (query?.error) throw query.error;
      return query?.data;
    } catch (error) {
      console.error(`Error checking if record exists in ${table}:`, error);
      return null;
    }
  };
  
  // Helper function for inserting records with proper typing
  const insertRecord = async (table: SupabaseTable, data: any) => {
    try {
      let result;
      
      switch (table) {
        case "statuts": {
          // Ensure required fields are present
          if (!data.code || !data.libelle || !data.couleur) {
            throw new Error("Missing required fields for statuts table");
          }
          const statutData: Partial<StatutData> = {
            id: data.id,
            code: data.code,
            libelle: data.libelle,
            couleur: data.couleur,
            display_order: data.display_order
          };
          result = await supabase.from("statuts").insert(statutData).select();
          break;
        }
        case "employes": {
          // Ensure required fields are present
          if (!data.nom) {
            throw new Error("Missing required fields for employes table");
          }
          const employeData: Partial<EmployeData> = {
            id: data.id,
            nom: data.nom,
            prenom: data.prenom,
            departement: data.departement,
            fonction: data.fonction,
            role: data.role,
            uid: data.uid
          };
          result = await supabase.from("employes").insert(employeData).select();
          break;
        }
        case "employe_schedule": {
          // Ensure required fields are present
          if (!data.date || !data.period || !data.statut_code) {
            throw new Error("Missing required fields for employe_schedule table");
          }
          const scheduleData: Partial<ScheduleData> = {
            id: data.id,
            employe_id: data.employe_id,
            date: data.date,
            period: data.period,
            statut_code: data.statut_code,
            project_code: data.project_code,
            is_highlighted: data.is_highlighted,
            note: data.note
          };
          result = await supabase.from("employe_schedule").insert(scheduleData).select();
          break;
        }
        case "Taches":
          result = await supabase.from("Taches").insert({
            id: data.id,
            created_at: data.created_at
          }).select();
          break;
        case "connection_logs":
          result = await supabase.from("connection_logs").insert({
            id: data.id,
            event_type: data.event_type,
            user_id: data.user_id,
            user_name: data.user_name,
            ip_address: data.ip_address,
            user_agent: data.user_agent
          }).select();
          break;
      }
      
      if (result?.error) throw result.error;
      return result?.data;
    } catch (error) {
      console.error(`Error inserting record into ${table}:`, error);
      return null;
    }
  };
  
  // Helper function for updating records with proper typing
  const updateRecord = async (table: SupabaseTable, idField: string, idValue: string, data: any) => {
    try {
      let result;
      
      switch (table) {
        case "statuts": {
          const updateData: Partial<StatutData> = {};
          if (data.code) updateData.code = data.code;
          if (data.libelle) updateData.libelle = data.libelle;
          if (data.couleur) updateData.couleur = data.couleur;
          if (data.display_order) updateData.display_order = data.display_order;
          
          result = await supabase.from("statuts").update(updateData).eq(idField, idValue).select();
          break;
        }
        case "employes": {
          const updateData: Partial<EmployeData> = {};
          if (data.nom) updateData.nom = data.nom;
          if (data.prenom) updateData.prenom = data.prenom;
          if (data.departement) updateData.departement = data.departement;
          if (data.fonction) updateData.fonction = data.fonction;
          if (data.role) updateData.role = data.role;
          if (data.uid) updateData.uid = data.uid;
          
          result = await supabase.from("employes").update(updateData).eq(idField, idValue).select();
          break;
        }
        case "employe_schedule": {
          const updateData: Partial<ScheduleData> = {};
          if (data.employe_id) updateData.employe_id = data.employe_id;
          if (data.date) updateData.date = data.date;
          if (data.period) updateData.period = data.period;
          if (data.statut_code) updateData.statut_code = data.statut_code;
          if (data.project_code !== undefined) updateData.project_code = data.project_code;
          if (data.is_highlighted !== undefined) updateData.is_highlighted = data.is_highlighted;
          if (data.note !== undefined) updateData.note = data.note;
          
          result = await supabase.from("employe_schedule").update(updateData).eq(idField, idValue).select();
          break;
        }
        case "Taches":
          result = await supabase.from("Taches").update({
            created_at: data.created_at
          }).eq(idField, idValue).select();
          break;
        case "connection_logs":
          result = await supabase.from("connection_logs").update({
            event_type: data.event_type,
            user_id: data.user_id,
            user_name: data.user_name,
            ip_address: data.ip_address,
            user_agent: data.user_agent
          }).eq(idField, idValue).select();
          break;
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
      let result;
      
      switch (table) {
        case "statuts":
          result = await supabase.from("statuts").select('*');
          break;
        case "employes":
          result = await supabase.from("employes").select('*');
          break;
        case "employe_schedule":
          result = await supabase.from("employe_schedule").select('*');
          break;
        case "Taches":
          result = await supabase.from("Taches").select('*');
          break;
        case "connection_logs":
          result = await supabase.from("connection_logs").select('*');
          break;
      }
      
      if (result?.error) throw result.error;
      
      setLastSyncTime(new Date());
      return result?.data || null;
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
