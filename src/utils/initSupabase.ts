
import { supabase } from '@/integrations/supabase/client';

export async function checkSupabaseTables() {
  try {
    console.log("Checking Supabase tables...");
    
    // Try to check tables in a safer way that handles potential failures gracefully
    const checkTable = async (tableName: string) => {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('id')
          .limit(1);
          
        if (error) {
          console.error(`Error checking ${tableName} table:`, error);
          return false;
        } else {
          console.log(`Successfully connected to ${tableName} table`);
          return true;
        }
      } catch (err) {
        console.error(`Exception when checking ${tableName} table:`, err);
        return false;
      }
    };
    
    // Check tables in sequence to avoid rate limiting
    const statusCheck = await checkTable("statuts");
    const employesCheck = await checkTable("employes");
    const scheduleCheck = await checkTable("employe_schedule");
    
    console.log("Supabase tables check complete");
    
    // Return true if at least one table is accessible
    return statusCheck || employesCheck || scheduleCheck;
  } catch (error) {
    console.error("Error during Supabase initialization:", error);
    return false;
  }
}
