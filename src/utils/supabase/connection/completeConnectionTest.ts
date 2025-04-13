
import { supabase } from '@/integrations/supabase/client';
import { isSupabaseClientInitialized, createTimeout, SUPABASE_URL, SUPABASE_KEY } from './connectionVerifier';
import { testTableQueries } from './tableQueries';
import { healthCheckTest } from './healthCheck';
import { sessionTest } from './sessionTest';

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
      const healthCheckResult = await healthCheckTest();
      if (healthCheckResult) {
        console.log("Connexion au serveur Supabase établie via health check");
        results.success = true;
        return results;
      }
    } catch (e) {
      console.warn("Échec de la vérification de base:", e);
    }
    
    // Test sur les tables principales
    const tableTestResult = await testTableQueries();
    if (tableTestResult.success) {
      if (tableTestResult.table === 'statuts') {
        results.details.statuts = true;
      } else if (tableTestResult.table === 'employes') {
        results.details.employes = true;
      }
      results.success = true;
      return results;
    }
    
    // Dernier recours: vérifier la session
    try {
      const sessionCheckResult = await sessionTest();
      if (sessionCheckResult) {
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
