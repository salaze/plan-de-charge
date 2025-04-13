
import { supabase } from '@/integrations/supabase/client';
import { ConnectionLogData, SyncResult } from '@/types/supabaseModels';

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
    
    // Use type assertion since 'connection_logs' might not be recognized by TypeScript's Supabase types
    const result = await supabase
      .from('connection_logs' as any) 
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
    
    // Use type assertion here since 'connection_logs' might not be recognized by TypeScript
    const result = await supabase
      .from('connection_logs' as any)
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
