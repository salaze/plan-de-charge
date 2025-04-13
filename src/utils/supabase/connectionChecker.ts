
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
    errorMessage?: string;
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
        fetch(`${supabase.supabaseUrl}/rest/v1/?apikey=${supabase.supabaseKey}`),
        timeout(2000)
      ]);
      
      if (healthCheck instanceof Response && healthCheck.ok) {
        console.log("Connexion au serveur Supabase établie");
        // Continuer avec un test plus approfondi
      } else {
        throw new Error("Échec de la connexion au serveur Supabase");
      }
    } catch (e) {
      console.warn("Échec de la vérification de base:", e);
      return {
        success: false,
        details: {
          error: e,
          errorMessage: "Impossible de se connecter au serveur Supabase"
        }
      };
    }
    
    // Test uniquement sur la table statuts (la plus importante et légère)
    try {
      const testPromise = supabase
        .from('statuts' as any)
        .select('count')
        .limit(1)
        .maybeSingle();
        
      // Ajouter un timeout de 2 secondes maximum
      const { data, error } = await Promise.race([
        testPromise,
        timeout(2000).then(() => { throw new Error('Timeout de connexion') })
      ]) as any;
      
      if (!error && data) {
        results.details.statuts = true;
        results.success = true;
      }
    } catch (e) {
      console.warn("Échec du test rapide sur la table statuts:", e);
      // Ne pas échouer immédiatement, essayer une autre table
    }
    
    // Si le test sur statuts échoue, essayer la table employes
    if (!results.success) {
      try {
        const testPromise = supabase
          .from('employes' as any)
          .select('count')
          .limit(1)
          .maybeSingle();
          
        // Ajouter un timeout de 2 secondes maximum
        const { data, error } = await Promise.race([
          testPromise,
          timeout(2000).then(() => { throw new Error('Timeout de connexion') })
        ]) as any;
        
        if (!error && data) {
          results.details.employes = true;
          results.success = true;
        }
      } catch (e) {
        console.warn("Échec du test rapide sur la table employes:", e);
      }
    }
    
    // Si tous les tests échouent, essayer une vérification simple de la session
    if (!results.success) {
      try {
        const sessionCheck = await Promise.race([
          supabase.auth.getSession(),
          timeout(1500)
        ]);
        
        if (sessionCheck && !('error' in sessionCheck)) {
          console.log("Connexion Supabase validée via le service d'authentification");
          results.success = true;
        }
      } catch (e) {
        console.warn("Échec de la vérification via le service d'authentification:", e);
      }
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

/**
 * Vérifie si le client Supabase est correctement initialisé
 * en utilisant uniquement des opérations synchrones
 */
export function isSupabaseClientInitialized(): boolean {
  try {
    // Vérification plus robuste du client
    if (!supabase) return false;
    if (!supabase.auth) return false;
    if (typeof supabase.from !== 'function') return false;
    if (!supabase.supabaseUrl || !supabase.supabaseKey) return false;
    
    return true;
  } catch (e) {
    console.error("Erreur lors de la vérification du client Supabase:", e);
    return false;
  }
}

/**
 * Effectue une vérification optimisée et rapide de la connexion 
 * avec plusieurs mécanismes de repli
 */
export async function checkSupabaseConnectionFast(): Promise<boolean> {
  try {
    // Timeout pour éviter les attentes trop longues
    const timeout = (ms: number) => new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), ms)
    );
    
    // Vérifier d'abord l'initialisation synchrone
    if (!isSupabaseClientInitialized()) {
      console.error("Le client Supabase n'est pas correctement initialisé");
      return false;
    }
    
    // Méthode 1: Essai rapide avec l'API REST de base
    try {
      const response = await Promise.race([
        fetch(`${supabase.supabaseUrl}/rest/v1/?apikey=${supabase.supabaseKey}`),
        timeout(1500)
      ]);
      
      if (response instanceof Response && response.ok) {
        return true;
      }
    } catch (e) {
      console.warn("Méthode 1 échouée:", e);
    }
    
    // Méthode 2: Test sur la table statuts
    try {
      const { error } = await Promise.race([
        supabase.from('statuts' as any).select('count').limit(1).maybeSingle(),
        timeout(1500)
      ]) as any;
      
      if (!error) {
        return true;
      }
    } catch (e) {
      console.warn("Méthode 2 échouée:", e);
    }
    
    // Méthode 3: Vérifier la session
    try {
      const { data, error } = await Promise.race([
        supabase.auth.getSession(),
        timeout(1000)
      ]) as any;
      
      if (!error) {
        return true;
      }
    } catch (e) {
      console.warn("Méthode 3 échouée:", e);
    }
    
    // Toutes les méthodes ont échoué
    return false;
  } catch (error) {
    console.error("Erreur lors de la vérification rapide:", error);
    return false;
  }
}
