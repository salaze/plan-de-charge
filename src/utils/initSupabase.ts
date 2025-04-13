import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SupabaseTable } from '@/types/supabase';

export async function checkSupabaseTables() {
  try {
    console.log("Vérification des tables Supabase...");
    
    // Try to check tables in a safer way that handles potential failures gracefully
    const checkTable = async (tableName: SupabaseTable) => {
      try {
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
    const checkTableWithRetry = async (tableName: SupabaseTable, retries = 1) => {
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

// Fonction optimisée pour tester la connexion à Supabase directement
export async function testSupabaseConnection() {
  try {
    console.log("Test optimisé de la connexion à Supabase...");
    
    // Ajouter un timeout pour éviter les attentes trop longues
    const timeout = (ms: number) => new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), ms)
    );
    
    // Essai simple avec timeout: Vérifier la table statuts (la plus légère)
    try {
      const testPromise = supabase
        .from('statuts' as any)
        .select('count')
        .limit(1)
        .single();
      
      // Attendre au maximum 2.5 secondes
      await Promise.race([
        testPromise,
        timeout(2500)
      ]);
      
      console.log("Connexion Supabase réussie via test rapide");
      return true;
    } catch (error) {
      // Si timeout ou erreur, essayer une requête encore plus simple
      console.warn("Premier test échoué, tentative avec auth.getSession", error);
      
      try {
        const { data, error } = await Promise.race([
          supabase.auth.getSession(),
          timeout(2000)
        ]) as any;
        
        if (!error) {
          console.log("Connexion Supabase établie via auth:", data);
          return true;
        }
      } catch (e) {
        console.error("Échec du second test:", e);
      }
    }
    
    return false;
  } catch (error) {
    console.error("Exception lors du test de connexion Supabase:", error);
    return false;
  }
}
