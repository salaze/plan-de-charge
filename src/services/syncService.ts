
import { supabase } from '@/integrations/supabase/client';
import { 
  TableDataType, 
  StatutData, 
  EmployeData, 
  ScheduleData, 
  TacheData,
  ConnectionLogData, 
  SyncResult
} from '@/types/supabaseModels';
import { checkRecordExists } from '@/utils/supabaseHelpers';
import {
  insertStatut,
  updateStatut,
  insertEmploye,
  updateEmploye,
  insertSchedule,
  updateSchedule,
  insertTache,
  updateTache,
  insertConnectionLog,
  updateConnectionLog
} from '@/utils/supabaseTableHelpers';
import { SupabaseTable } from '@/types/supabase';

// Type-safe sync function for specific table types
export async function syncTableData<T extends SupabaseTable>(
  data: Record<string, any>,
  table: T,
  idField: string = 'id'
): Promise<SyncResult> {
  try {
    const idValue = data[idField] as string;
    if (!idValue) {
      return { 
        success: false, 
        error: new Error(`Missing ID field ${idField}`) 
      };
    }
    
    // Check if record exists
    const existingData = await checkRecordExists(table, idField, idValue);
    
    // Depending on the table and whether the record exists, insert or update
    if (existingData) {
      // Update existing record
      switch(table) {
        case 'statuts':
          return await updateStatut(idValue, data as Partial<StatutData>);
        case 'employes':
          return await updateEmploye(idValue, data as Partial<EmployeData>);
        case 'employe_schedule':
          return await updateSchedule(idValue, data as Partial<ScheduleData>);
        case 'taches':
          return await updateTache(idValue, data as Partial<TacheData>);
        case 'connection_logs':
          return await updateConnectionLog(idValue, data as Partial<ConnectionLogData>);
        default:
          return {
            success: false,
            error: new Error(`Unsupported table: ${table}`)
          };
      }
    } else {
      // Insert new record
      switch(table) {
        case 'statuts':
          return await insertStatut(data as StatutData);
        case 'employes':
          return await insertEmploye(data as EmployeData);
        case 'employe_schedule':
          return await insertSchedule(data as ScheduleData);
        case 'taches':
          return await insertTache(data as TacheData);
        case 'connection_logs':
          return await insertConnectionLog(data as ConnectionLogData);
        default:
          return {
            success: false,
            error: new Error(`Unsupported table: ${table}`)
          };
      }
    }
  } catch (error) {
    console.error(`Error synchronizing data with ${table}:`, error);
    return { success: false, error };
  }
}
