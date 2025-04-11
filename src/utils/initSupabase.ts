
import { supabase } from '@/integrations/supabase/client';

export async function checkSupabaseTables() {
  try {
    console.log("Checking Supabase tables...");
    
    // Check if 'statuts' table exists instead, since it's in the database schema
    const { data: statusTable, error: statusError } = await supabase
      .from('statuts')
      .select('id')
      .limit(1);
      
    if (statusError) {
      console.error("Error checking statuts table:", statusError);
    }
    
    // Check if 'employes' table exists
    const { data: employesTable, error: employesError } = await supabase
      .from('employes')
      .select('id')
      .limit(1);
      
    if (employesError) {
      console.error("Error checking employes table:", employesError);
    }
    
    console.log("Supabase tables check complete");
  } catch (error) {
    console.error("Error during Supabase initialization:", error);
  }
}
