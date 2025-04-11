
import { supabase } from '@/integrations/supabase/client';
import { TableDataType, SyncResult } from '@/types/supabaseModels';
import { SupabaseTable } from '@/types/supabase';

// Helper function to check if record exists
export async function checkRecordExists<T extends SupabaseTable>(
  table: T,
  idField: string, 
  idValue: string
): Promise<any> {
  try {
    const { data, error } = await supabase
      .from(table)
      .select(idField)
      .eq(idField, idValue)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error checking if record exists in ${table}:`, error);
    return null;
  }
}

// Generic function for fetching data from a table
export async function fetchFromTable<T extends SupabaseTable>(table: T): Promise<TableDataType[T][] | null> {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*');
    
    if (error) throw error;
    return data as TableDataType[T][];
  } catch (error) {
    console.error(`Error fetching from ${table}:`, error);
    return null;
  }
}
