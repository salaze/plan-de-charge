
import { supabase } from '@/integrations/supabase/client';
import { ConnectionLog } from '@/types';

// Helper function to validate a ConnectionLog object
const isValidConnectionLog = (data: any): data is ConnectionLog => {
  return (
    data &&
    typeof data === 'object' &&
    'id' in data &&
    typeof data.id === 'string' &&
    'created_at' in data
  );
};

export const connectionLogService = {
  async getAll(): Promise<ConnectionLog[]> {
    try {
      const { data, error } = await supabase
        .from('connection_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching connection logs:', error);
        return [];
      }

      // Filter and validate each item before returning
      if (Array.isArray(data)) {
        return data.filter(isValidConnectionLog);
      }
      
      return [];
    } catch (error) {
      console.error('Unexpected error in getAll connection logs:', error);
      return [];
    }
  },

  async create(logData: Partial<Omit<ConnectionLog, 'id' | 'created_at'>>): Promise<ConnectionLog | null> {
    try {
      const { data, error } = await supabase
        .from('connection_logs')
        .insert([logData])
        .select()
        .single();

      if (error) {
        console.error('Error creating connection log:', error);
        return null;
      }

      // Validate the returned data
      if (isValidConnectionLog(data)) {
        return data;
      }
      
      return null;
    } catch (error) {
      console.error('Unexpected error in create connection log:', error);
      return null;
    }
  }
};
