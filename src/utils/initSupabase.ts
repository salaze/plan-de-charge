
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define valid table names as literals to match what Supabase expects
type ValidTableName = "statuts" | "employes" | "employe_schedule" | "taches" | "connection_logs" | "projets";

export async function checkSupabaseTables() {
  try {
    console.log("Vérification des tables Supabase...");
    
    // Try to check tables in a safer way that handles potential failures gracefully
    const checkTable = async (tableName: ValidTableName) => {
      try {
        // Use type assertion to tell TypeScript that the table name is valid
        const { data, error } = await supabase
          .from(tableName as any)
          .select('id')
          .limit(1);
          
        if (error) {
          console.error(`Erreur lors de la vérification de la table ${tableName}:`, error);
          return { success: false, error };
        } else {
          console.log(`Connexion réussie à la table ${tableName}`);
          return { success: true, data };
        }
      } catch (err) {
        console.error(`Exception lors de la vérification de la table ${tableName}:`, err);
        return { success: false, error: err };
      }
    };
    
    // Add retry mechanism for more reliability
    const checkTableWithRetry = async (tableName: ValidTableName, retries = 1) => {
      for (let i = 0; i <= retries; i++) {
        const result = await checkTable(tableName);
        if (result.success) return result;
        
        if (i < retries) {
          // Wait a bit longer between retries
          await new Promise(resolve => setTimeout(resolve, 500));
          console.log(`Nouvelle tentative de vérification pour ${tableName}, tentative ${i + 2}`);
        }
      }
      return { success: false };
    };
    
    try {
      // Check each table with sequential execution to avoid rate limiting issues
      const statusCheck = await checkTableWithRetry("statuts");
      await new Promise(resolve => setTimeout(resolve, 200)); 
      
      const employesCheck = await checkTableWithRetry("employes");
      await new Promise(resolve => setTimeout(resolve, 200)); 
      
      const scheduleCheck = await checkTableWithRetry("employe_schedule");
      
      console.log("Vérification des tables Supabase terminée");
      
      // Return simplified result (boolean success)
      return { 
        success: statusCheck.success || employesCheck.success || scheduleCheck.success,
        details: {
          statuts: statusCheck,
          employes: employesCheck,
          schedule: scheduleCheck
        }
      };
    } catch (e) {
      console.error("Erreur lors des vérifications des tables:", e);
      toast.error("Erreur lors de la vérification des tables Supabase");
      return { 
        success: false, 
        error: e 
      };
    }
  } catch (error) {
    console.error("Erreur lors de l'initialisation de Supabase:", error);
    toast.error("Erreur lors de l'initialisation de Supabase");
    return { 
      success: false, 
      error 
    };
  }
}

// Fonction pour tester la connexion à Supabase directement
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('statuts').select('count(*)');
    
    if (error) {
      console.error("Erreur de connexion Supabase:", error);
      toast.error("Impossible de se connecter à Supabase");
      return false;
    }
    
    console.log("Connexion Supabase établie avec succès:", data);
    toast.success("Connexion Supabase établie avec succès");
    return true;
  } catch (error) {
    console.error("Exception lors du test de connexion Supabase:", error);
    toast.error("Erreur lors de la connexion à Supabase");
    return false;
  }
}
