
import { supabase } from '@/integrations/supabase/client';
import { ScheduleData, SyncResult, isValidSchedule } from '@/types/supabaseModels';

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
      .from('employe_schedule' as any)
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
      .from('employe_schedule' as any)
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
