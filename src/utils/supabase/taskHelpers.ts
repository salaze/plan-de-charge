
import { supabase } from '@/integrations/supabase/client';
import { TacheData, SyncResult } from '@/types/supabaseModels';

// Taches table operations
export async function insertTache(data: TacheData): Promise<SyncResult> {
  try {
    const result = await supabase
      .from('taches' as any)
      .insert({
        created_at: data.created_at,
        id: parseInt(data.id || '0') // Convert string id to number
      })
      .select();
    
    if (result.error) throw result.error;
    return { success: true, data: result.data };
  } catch (error) {
    console.error(`Error inserting record into taches:`, error);
    return { success: false, error };
  }
}

export async function updateTache(idValue: string, data: Partial<TacheData>): Promise<SyncResult> {
  try {
    const result = await supabase
      .from('taches' as any)
      .update({
        created_at: data.created_at
      })
      .eq('id', parseInt(idValue)) // Convert string id to number
      .select();
    
    if (result.error) throw result.error;
    return { success: true, data: result.data };
  } catch (error) {
    console.error(`Error updating record in taches:`, error);
    return { success: false, error };
  }
}
