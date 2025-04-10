import { supabase } from '@/integrations/supabase/client';
import { ConnectionLog } from '@/types';

// Helper function to map database fields to ConnectionLog type
const mapDbLogToConnectionLog = (dbLog: any): ConnectionLog => {
  return {
    id: dbLog.id,
    userId: dbLog.user_id,
    userName: dbLog.user_name,
    eventType: dbLog.event_type,
    createdAt: dbLog.created_at,
    ipAddress: dbLog.ip_address,
    userAgent: dbLog.user_agent,
    // Keep original fields for backward compatibility
    user_id: dbLog.user_id,
    user_name: dbLog.user_name,
    event_type: dbLog.event_type,
    created_at: dbLog.created_at,
    ip_address: dbLog.ip_address,
    user_agent: dbLog.user_agent
  };
};

// Helper function to validate a ConnectionLog object
const isValidConnectionLog = (data: any): boolean => {
  return (
    data &&
    typeof data === 'object' &&
    'id' in data &&
    typeof data.id === 'string'
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

      // Map and validate each item before returning
      if (Array.isArray(data)) {
        return data.filter(isValidConnectionLog).map(mapDbLogToConnectionLog);
      }
      
      return [];
    } catch (error) {
      console.error('Unexpected error in getAll connection logs:', error);
      return [];
    }
  },

  async create(logData: Partial<Omit<ConnectionLog, 'id' | 'createdAt'>>): Promise<ConnectionLog | null> {
    try {
      // Convert from our app format to database format
      const dbLogData = {
        user_id: logData.userId,
        user_name: logData.userName,
        event_type: logData.eventType,
        ip_address: logData.ipAddress,
        user_agent: logData.userAgent
      };

      const { data, error } = await supabase
        .from('connection_logs')
        .insert([dbLogData])
        .select()
        .single();

      if (error) {
        console.error('Error creating connection log:', error);
        return null;
      }

      // Map the response back to our app format
      if (isValidConnectionLog(data)) {
        return mapDbLogToConnectionLog(data);
      }
      
      return null;
    } catch (error) {
      console.error('Unexpected error in create connection log:', error);
      return null;
    }
  }
};
