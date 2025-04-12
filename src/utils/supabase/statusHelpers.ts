
import { supabase } from '@/integrations/supabase/client';
import { StatutData, SyncResult, isValidStatut } from '@/types/supabaseModels';

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
      .from('statuts' as any)
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
      .from('statuts' as any)
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
