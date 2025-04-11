
import { supabase } from '@/integrations/supabase/client';

export async function checkSupabaseTables() {
  try {
    console.log("Checking Supabase tables...");
    
    // Check if 'projets' table exists
    const { data: projetsTable, error: projectsError } = await supabase
      .from('projets')
      .select('id')
      .limit(1);
      
    if (projectsError) {
      console.error("Error checking projets table:", projectsError);
    }
    
    console.log("Supabase tables check complete");
  } catch (error) {
    console.error("Error during Supabase initialization:", error);
  }
}
