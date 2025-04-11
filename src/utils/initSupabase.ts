
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
    
    // Add retry mechanism for more reliability
    const checkTableWithRetry = async (tableName: ValidTableName, retries = 1) => {
      for (let i = 0; i <= retries; i++) {
        const result = await checkTable(tableName);
        if (result) return true;
        
        if (i < retries) {
          // Wait a bit longer between retries
          await new Promise(resolve => setTimeout(resolve, 500));
          console.log(`Retrying check for ${tableName}, attempt ${i + 2}`);
        }
      }
      return false;
    };
    
    try {
      // Check each table with sequential execution to avoid rate limiting issues
      const statusCheck = await checkTableWithRetry("statuts");
      await new Promise(resolve => setTimeout(resolve, 200)); 
      
      const employesCheck = await checkTableWithRetry("employes");
      await new Promise(resolve => setTimeout(resolve, 200)); 
      
      const scheduleCheck = await checkTableWithRetry("employe_schedule");
      
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
