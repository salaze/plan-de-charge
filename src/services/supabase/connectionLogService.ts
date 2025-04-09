
import { supabase } from '@/integrations/supabase/client';
import { ConnectionLog } from '@/types';

export const connectionLogService = {
  async getAll(): Promise<ConnectionLog[]> {
    try {
      const { data, error } = await supabase
        .from('connection_logs' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching connection logs:', error);
        return [];
      }

      return (Array.isArray(data) ? data : []) as ConnectionLog[];
    } catch (error) {
      console.error('Unexpected error in getAll connection logs:', error);
      return [];
    }
  },

  async create(logData: Omit<ConnectionLog, 'id' | 'created_at'>): Promise<ConnectionLog | null> {
    try {
      const { data, error } = await supabase
        .from('connection_logs' as any)
        .insert([logData as any])
        .select()
        .single();

      if (error) {
        console.error('Error creating connection log:', error);
        return null;
      }

      return data as ConnectionLog;
    } catch (error) {
      console.error('Unexpected error in create connection log:', error);
      return null;
    }
  }
};
