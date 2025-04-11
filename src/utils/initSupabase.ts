
import { supabase } from '@/integrations/supabase/client';

// Define valid table names as literals to match what Supabase expects
type ValidTableName = "statuts" | "employes" | "employe_schedule" | "taches" | "connection_logs" | "projets";

export async function checkSupabaseTables() {
  try {
    console.log("Checking Supabase tables...");
    
    // Try to check tables in a safer way that handles potential failures gracefully
    const checkTable = async (tableName: ValidTableName) => {
      try {
        // Use type assertion to tell TypeScript that the table name is valid
        const { data, error } = await supabase
          .from(tableName as any)
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
    
    try {
      // Check each table with a small delay between requests to avoid rate limiting
      const statusCheck = await checkTable("statuts");
      await new Promise(resolve => setTimeout(resolve, 100)); 
      
      const employesCheck = await checkTable("employes");
      await new Promise(resolve => setTimeout(resolve, 100)); 
      
      const scheduleCheck = await checkTable("employe_schedule");
      
      console.log("Supabase tables check complete");
      
      // Return true if at least one table is accessible
      return statusCheck || employesCheck || scheduleCheck;
    } catch (e) {
      console.error("Error in table checks:", e);
      return false;
    }
  } catch (error) {
    console.error("Error during Supabase initialization:", error);
    return false;
  }
}
