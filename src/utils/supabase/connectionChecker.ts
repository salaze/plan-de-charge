
import { supabase } from '@/integrations/supabase/client';

/**
 * Effectue une vérification complète de la connexion à Supabase
 * avec plusieurs méthodes de test différentes
 */
export async function checkCompleteSupabaseConnection(): Promise<{
  success: boolean;
  details: {
    statuts?: boolean;
    employes?: boolean;
    statusCount?: number | null;
    employeCount?: number | null;
    error?: any;
  }
}> {
  try {
    console.log("Vérification complète de la connexion Supabase...");
    
    // Résultats de test
    const results = {
      success: false,
      details: {
        statuts: false,
        employes: false,
        statusCount: null as number | null,
        employeCount: null as number | null
      }
    };

    // Test 1: Table statuts
    try {
      const { data: statusData, error: statusError } = await supabase
        .from('statuts')
        .select('count(*)')
        .single();
      
      if (!statusError) {
        results.details.statuts = true;
        results.details.statusCount = statusData?.count || 0;
        results.success = true; // Au moins un test a réussi
      }
    } catch (e) {
      console.error("Échec du test sur la table statuts:", e);
    }
    
    // Test 2: Table employes
    try {
      const { data: employesData, error: employesError } = await supabase
        .from('employes')
        .select('count(*)')
        .single();
      
      if (!employesError) {
        results.details.employes = true;
        results.details.employeCount = employesData?.count || 0;
        results.success = true; // Au moins un test a réussi
      }
    } catch (e) {
      console.error("Échec du test sur la table employes:", e);
    }
    
    console.log("Résultats de la vérification complète:", results);
    return results;
    
  } catch (error) {
    console.error("Erreur lors de la vérification complète:", error);
    return {
      success: false,
      details: {
        error
      }
    };
  }
}

/**
 * Vérifie si le client Supabase est correctement initialisé
 */
export function isSupabaseClientInitialized(): boolean {
  try {
    return !!supabase && !!supabase.auth && typeof supabase.from === 'function';
  } catch (e) {
    console.error("Erreur lors de la vérification du client Supabase:", e);
    return false;
  }
}
