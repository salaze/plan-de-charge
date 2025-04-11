
import { supabase } from '@/integrations/supabase/client';

export async function checkSupabaseTables() {
  try {
    console.log("Checking Supabase tables...");
    
    // Check if 'statuts' table exists, which is used for connection testing
    const { data: statusTable, error: statusError } = await supabase
      .from('statuts')
      .select('id')
      .limit(1);
      
    if (statusError) {
      console.error("Error checking statuts table:", statusError);
    } else {
      console.log("Successfully connected to statuts table");
    }
    
    // Check if 'employes' table exists
    const { data: employesTable, error: employesError } = await supabase
      .from('employes')
      .select('id')
      .limit(1);
      
    if (employesError) {
      console.error("Error checking employes table:", employesError);
    } else {
      console.log("Successfully connected to employes table");
    }
    
    // Check if 'employe_schedule' table exists
    const { data: scheduleTable, error: scheduleError } = await supabase
      .from('employe_schedule')
      .select('id')
      .limit(1);
      
    if (scheduleError) {
      console.error("Error checking employe_schedule table:", scheduleError);
    } else {
      console.log("Successfully connected to employe_schedule table");
    }
    
    console.log("Supabase tables check complete");
    return true;
  } catch (error) {
    console.error("Error during Supabase initialization:", error);
    return false;
  }
}
