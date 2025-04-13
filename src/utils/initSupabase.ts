import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define valid table names as literals to match what Supabase expects
type ValidTableName = "statuts" | "employes" | "employe_schedule" | "taches";

export async function checkSupabaseTables() {
  try {
    console.log("Vérification des tables Supabase...");
    
    // Try to check tables in a safer way that handles potential failures gracefully
    const checkTable = async (tableName: ValidTableName) => {
      try {
        // Use a type assertion to match the expected table names
        const { data, error } = await supabase
          .from(tableName as "statuts" | "employes" | "employe_schedule" | "taches")
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
      // Check the statuts table first as it's the most critical for the app
      console.log("Tentative de vérification de la table statuts...");
      const statusCheck = await checkTableWithRetry("statuts", 2);
      
      if (statusCheck.success) {
        console.log("Connexion à la table statuts réussie");
        return { success: true, details: { statuts: statusCheck } };
      }
      
      // If statuts failed, try employes table
      console.log("Tentative de vérification de la table employes...");
      const employesCheck = await checkTableWithRetry("employes", 1);
      
      if (employesCheck.success) {
        console.log("Connexion à la table employes réussie");
        return { success: true, details: { employes: employesCheck } };
      }
      
      // If both failed, return failure
      console.log("Échec de la connexion aux tables principales");
      return { 
        success: false,
        details: {
          statuts: statusCheck,
          employes: employesCheck
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
    console.log("Test de la connexion à Supabase...");
    
    // Essai 1: Vérifier la table statuts (la plus légère)
    const { data: statusData, error: statusError } = await supabase
      .from('statuts')
      .select('count')
      .single();
      
    if (!statusError) {
      console.log("Connexion Supabase réussie via table statuts:", statusData);
      return true;
    }
    
    console.warn("Échec du premier test via statuts, tentative avec employes...");
    
    // Essai 2: Vérifier la table employes
    const { data: employesData, error: employesError } = await supabase
      .from('employes')
      .select('count')
      .single();
      
    if (!employesError) {
      console.log("Connexion Supabase réussie via table employes:", employesData);
      return true;
    }
    
    // Essai 3: Vérification simple pour voir si la connexion est établie
    const { data, error } = await supabase.auth.getSession();
    
    if (!error) {
      console.log("Connexion Supabase établie via auth:", data);
      return true;
    }
    
    // Si tous les essais échouent, afficher les erreurs détaillées
    console.error("Échec de tous les tests de connexion:", { 
      statusError, 
      employesError, 
      authError: error 
    });
    
    return false;
  } catch (error) {
    console.error("Exception lors du test de connexion Supabase:", error);
    return false;
  }
}
