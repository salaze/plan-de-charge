
import { supabase } from '@/integrations/supabase/client';
import { 
  StatutData, 
  EmployeData, 
  ScheduleData, 
  TacheData, 
  ConnectionLogData,
  SyncResult,
  isValidStatut,
  isValidEmploye,
  isValidSchedule 
} from '@/types/supabaseModels';

// Status table operations
export async function insertStatut(data: StatutData): Promise<SyncResult> {
  try {
    if (!isValidStatut(data)) {
      return { 
        success: false, 
        error: new Error("Missing required fields for statuts table") 
      };
    }
    
    const insertData = {
      code: data.code,
      libelle: data.libelle,
      couleur: data.couleur,
      display_order: data.display_order || 0,
      id: data.id
    };
    
    const result = await supabase
      .from('statuts')
      .insert(insertData)
      .select();
    
    if (result.error) throw result.error;
    return { success: true, data: result.data };
  } catch (error) {
    console.error(`Error inserting record into statuts:`, error);
    return { success: false, error };
  }
}

export async function updateStatut(idValue: string, data: Partial<StatutData>): Promise<SyncResult> {
  try {
    const updateData: Partial<StatutData> = {};
    if (data.code !== undefined) updateData.code = data.code;
    if (data.libelle !== undefined) updateData.libelle = data.libelle;
    if (data.couleur !== undefined) updateData.couleur = data.couleur;
    if (data.display_order !== undefined) updateData.display_order = data.display_order;
    
    const result = await supabase
      .from('statuts')
      .update(updateData)
      .eq('id', idValue)
      .select();
    
    if (result.error) throw result.error;
    return { success: true, data: result.data };
  } catch (error) {
    console.error(`Error updating record in statuts:`, error);
    return { success: false, error };
  }
}

// Employee table operations
export async function insertEmploye(data: EmployeData): Promise<SyncResult> {
  try {
    if (!isValidEmploye(data)) {
      return { 
        success: false, 
        error: new Error("Missing required fields for employes table") 
      };
    }
    
    const insertData = {
      id: data.id,
      nom: data.nom,
      prenom: data.prenom,
      departement: data.departement,
      fonction: data.fonction,
      role: data.role,
      uid: data.uid
    };
    
    const result = await supabase
      .from('employes')
      .insert(insertData)
      .select();
    
    if (result.error) throw result.error;
    return { success: true, data: result.data };
  } catch (error) {
    console.error(`Error inserting record into employes:`, error);
    return { success: false, error };
  }
}

export async function updateEmploye(idValue: string, data: Partial<EmployeData>): Promise<SyncResult> {
  try {
    const updateData: Partial<EmployeData> = {};
    if (data.nom !== undefined) updateData.nom = data.nom;
    if (data.prenom !== undefined) updateData.prenom = data.prenom;
    if (data.departement !== undefined) updateData.departement = data.departement;
    if (data.fonction !== undefined) updateData.fonction = data.fonction;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.uid !== undefined) updateData.uid = data.uid;
    
    const result = await supabase
      .from('employes')
      .update(updateData)
      .eq('id', idValue)
      .select();
    
    if (result.error) throw result.error;
    return { success: true, data: result.data };
  } catch (error) {
    console.error(`Error updating record in employes:`, error);
    return { success: false, error };
  }
}

// Schedule table operations
export async function insertSchedule(data: ScheduleData): Promise<SyncResult> {
  try {
    if (!isValidSchedule(data)) {
      return { 
        success: false, 
        error: new Error("Missing required fields for employe_schedule table") 
      };
    }
    
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
    
    const result = await supabase
      .from('employe_schedule')
      .insert(insertData)
      .select();
    
    if (result.error) throw result.error;
    return { success: true, data: result.data };
  } catch (error) {
    console.error(`Error inserting record into employe_schedule:`, error);
    return { success: false, error };
  }
}

export async function updateSchedule(idValue: string, data: Partial<ScheduleData>): Promise<SyncResult> {
  try {
    const updateData: Partial<ScheduleData> = {};
    if (data.employe_id !== undefined) updateData.employe_id = data.employe_id;
    if (data.date !== undefined) updateData.date = data.date;
    if (data.period !== undefined) updateData.period = data.period;
    if (data.statut_code !== undefined) updateData.statut_code = data.statut_code;
    if (data.project_code !== undefined) updateData.project_code = data.project_code;
    if (data.is_highlighted !== undefined) updateData.is_highlighted = data.is_highlighted;
    if (data.note !== undefined) updateData.note = data.note;
    
    const result = await supabase
      .from('employe_schedule')
      .update(updateData)
      .eq('id', idValue)
      .select();
    
    if (result.error) throw result.error;
    return { success: true, data: result.data };
  } catch (error) {
    console.error(`Error updating record in employe_schedule:`, error);
    return { success: false, error };
  }
}

// Taches table operations
export async function insertTache(data: TacheData): Promise<SyncResult> {
  try {
    const insertData = {
      id: data.id,
      created_at: data.created_at
    };
    
    const result = await supabase
      .from('Taches')
      .insert(insertData)
      .select();
    
    if (result.error) throw result.error;
    return { success: true, data: result.data };
  } catch (error) {
    console.error(`Error inserting record into Taches:`, error);
    return { success: false, error };
  }
}

export async function updateTache(idValue: string, data: Partial<TacheData>): Promise<SyncResult> {
  try {
    const result = await supabase
      .from('Taches')
      .update({
        created_at: data.created_at
      })
      .eq('id', idValue)
      .select();
    
    if (result.error) throw result.error;
    return { success: true, data: result.data };
  } catch (error) {
    console.error(`Error updating record in Taches:`, error);
    return { success: false, error };
  }
}

// Connection logs table operations
export async function insertConnectionLog(data: ConnectionLogData): Promise<SyncResult> {
  try {
    const insertData = {
      id: data.id,
      event_type: data.event_type,
      user_id: data.user_id,
      user_name: data.user_name,
      ip_address: data.ip_address,
      user_agent: data.user_agent
    };
    
    const result = await supabase
      .from('connection_logs')
      .insert(insertData)
      .select();
    
    if (result.error) throw result.error;
    return { success: true, data: result.data };
  } catch (error) {
    console.error(`Error inserting record into connection_logs:`, error);
    return { success: false, error };
  }
}

export async function updateConnectionLog(idValue: string, data: Partial<ConnectionLogData>): Promise<SyncResult> {
  try {
    const updateData: Partial<ConnectionLogData> = {};
    if (data.event_type !== undefined) updateData.event_type = data.event_type;
    if (data.user_id !== undefined) updateData.user_id = data.user_id;
    if (data.user_name !== undefined) updateData.user_name = data.user_name;
    if (data.ip_address !== undefined) updateData.ip_address = data.ip_address;
    if (data.user_agent !== undefined) updateData.user_agent = data.user_agent;
    
    const result = await supabase
      .from('connection_logs')
      .update(updateData)
      .eq('id', idValue)
      .select();
    
    if (result.error) throw result.error;
    return { success: true, data: result.data };
  } catch (error) {
    console.error(`Error updating record in connection_logs:`, error);
    return { success: false, error };
  }
}
