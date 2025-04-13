
import { supabase } from '@/integrations/supabase/client';

/**
 * Effectue une vérification rapide de la connexion à Supabase
 * en utilisant la méthode la plus légère possible
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
    console.log("Vérification optimisée de la connexion Supabase...");
    
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

    // Test rapide avec timeout pour éviter les longues attentes
    const timeout = (ms: number) => new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), ms)
    );
    
    // Test uniquement sur la table statuts (la plus importante et légère)
    try {
      const testPromise = supabase
        .from('statuts' as any)
        .select('count')
        .limit(1)
        .single();
        
      // Ajouter un timeout de 3 secondes maximum
      const { data, error } = await Promise.race([
        testPromise,
        timeout(3000).then(() => { throw new Error('Timeout de connexion') })
      ]) as any;
      
      if (!error && data) {
        results.details.statuts = true;
        results.success = true;
      }
    } catch (e) {
      console.warn("Échec du test rapide sur la table statuts:", e);
    }
    
    console.log("Résultats de la vérification rapide:", results);
    return results;
    
  } catch (error) {
    console.error("Erreur lors de la vérification:", error);
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
 * en utilisant uniquement des opérations synchrones
 */
export function isSupabaseClientInitialized(): boolean {
  try {
    return !!supabase && !!supabase.auth && typeof supabase.from === 'function';
  } catch (e) {
    console.error("Erreur lors de la vérification du client Supabase:", e);
    return false;
  }
}
