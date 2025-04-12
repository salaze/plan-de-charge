
import { supabase } from '@/integrations/supabase/client';
import { EmployeData, SyncResult, isValidEmploye } from '@/types/supabaseModels';

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
      identifiant: data.identifiant || data.uid  // Use identifiant or uid if available
    };
    
    const result = await supabase
      .from('employes' as any)
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
    
    // Handle both uid and identifiant fields for backward compatibility
    if (data.uid !== undefined) updateData.identifiant = data.uid;
    if (data.identifiant !== undefined) updateData.identifiant = data.identifiant;
    
    const result = await supabase
      .from('employes' as any)
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
