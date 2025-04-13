
import { supabase } from '@/integrations/supabase/client';
import { isSupabaseClientInitialized, createTimeout, SUPABASE_URL, SUPABASE_KEY } from './connectionVerifier';

/**
 * Type for connection test results
 */
export interface ConnectionTestResult {
  success: boolean;
  details: {
    statuts?: boolean;
    employes?: boolean;
    statusCount?: number | null;
    employeCount?: number | null;
    error?: any;
    errorMessage?: string;
  }
}

/**
 * Effectue une vérification complète de la connexion à Supabase
 * en utilisant la méthode la plus légère possible
 */
export async function checkCompleteSupabaseConnection(): Promise<ConnectionTestResult> {
  try {
    console.log("Vérification optimisée de la connexion Supabase...");
    
    // Résultats de test
    const results: ConnectionTestResult = {
      success: false,
      details: {
        statuts: false,
        employes: false,
        statusCount: null as number | null,
        employeCount: null as number | null
      }
    };

    // Vérification initiale de l'initialisation du client
    if (!isSupabaseClientInitialized()) {
      console.error("Le client Supabase n'est pas correctement initialisé");
      return {
        success: false,
        details: {
          error: new Error("Le client Supabase n'est pas correctement initialisé"),
          errorMessage: "Erreur d'initialisation du client Supabase"
        }
      };
    }
    
    // Test avec la méthode de transport la plus légère possible (health check)
    try {
      const healthCheck = await Promise.race([
        fetch(`${SUPABASE_URL}/rest/v1/`, {
          headers: {
            'apikey': SUPABASE_KEY,
            'Content-Type': 'application/json'
          }
        }),
        createTimeout(3000)
      ]);
      
      if (healthCheck instanceof Response && healthCheck.ok) {
        console.log("Connexion au serveur Supabase établie");
        results.success = true;
        return results;
      }
    } catch (e) {
      console.warn("Échec de la vérification de base:", e);
      // Continue with additional checks
    }
    
    // Test uniquement sur la table statuts (la plus importante et légère)
    try {
      const testPromise = supabase
        .from('statuts')
        .select('count')
        .limit(1)
        .maybeSingle();
        
      // Ajouter un timeout de 2 secondes maximum
      const { data, error } = await Promise.race([
        testPromise,
        createTimeout(3000).then(() => { throw new Error('Timeout de connexion') })
      ]) as any;
      
      if (!error && data) {
        results.details.statuts = true;
        results.success = true;
        return results;
      }
    } catch (e) {
      console.warn("Échec du test rapide sur la table statuts:", e);
      // Try other methods
    }
    
    // Si le test sur statuts échoue, essayer la table employes
    try {
      const testPromise = supabase
        .from('employes')
        .select('count')
        .limit(1)
        .maybeSingle();
          
      // Ajouter un timeout de 3 secondes maximum
      const { data, error } = await Promise.race([
        testPromise,
        createTimeout(3000).then(() => { throw new Error('Timeout de connexion') })
      ]) as any;
      
      if (!error && data) {
        results.details.employes = true;
        results.success = true;
        return results;
      }
    } catch (e) {
      console.warn("Échec du test rapide sur la table employes:", e);
    }
    
    // Dernier recours: vérifier la session
    try {
      const sessionCheck = await Promise.race([
        supabase.auth.getSession(),
        createTimeout(2000)
      ]);
      
      // Type guard to check if sessionCheck is an object with data property
      if (sessionCheck && typeof sessionCheck === 'object' && 'data' in sessionCheck) {
        console.log("Connexion Supabase validée via le service d'authentification");
        results.success = true;
        return results;
      }
    } catch (e) {
      console.warn("Échec de la vérification via le service d'authentification:", e);
    }
    
    console.log("Résultats de la vérification rapide:", results);
    return results;
    
  } catch (error) {
    console.error("Erreur lors de la vérification:", error);
    return {
      success: false,
      details: {
        error,
        errorMessage: error instanceof Error ? error.message : "Erreur inconnue de connexion"
      }
    };
  }
}
