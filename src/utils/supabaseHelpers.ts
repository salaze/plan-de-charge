
import { supabase } from '@/integrations/supabase/client';
import { SupabaseTable } from '@/types/supabase';

// Helper function to check if record exists
export async function checkRecordExists(
  table: SupabaseTable,
  idField: string, 
  idValue: string
): Promise<any> {
  try {
    // Use explicit type assertion to avoid recursive type instantiation
    const result = await supabase
      .from(table as any)
      .select(idField)
      .eq(idField, idValue)
      .maybeSingle();
    
    if (result.error) throw result.error;
    return result.data;
  } catch (error) {
    console.error(`Error checking if record exists in ${table}:`, error);
    return null;
  }
}

// Generic function for fetching data from a table
export async function fetchFromTable(table: SupabaseTable): Promise<unknown[] | null> {
  try {
    const { data, error } = await supabase
      .from(table as any)
      .select('*');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching from ${table}:`, error);
    return null;
  }
}
