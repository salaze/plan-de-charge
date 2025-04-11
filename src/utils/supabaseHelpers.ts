
import { supabase } from '@/integrations/supabase/client';

// Define valid table names to match Supabase's expected types
type ValidTableName = "statuts" | "employes" | "employe_schedule" | "taches" | "connection_logs" | "projets";

// Helper function to check if record exists
export async function checkRecordExists(
  table: ValidTableName,
  idField: string, 
  idValue: string
): Promise<any> {
  try {
    // Use type assertion to tell TypeScript that the table name is valid
    const { data, error } = await supabase
      .from(table as any)
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
export async function fetchFromTable(table: ValidTableName): Promise<unknown[] | null> {
  try {
    // Use type assertion to tell TypeScript that the table name is valid
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
