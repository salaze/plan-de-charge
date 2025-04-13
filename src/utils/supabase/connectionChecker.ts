
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
      // URL et clé fixées
      const supabaseUrl = "https://ggfgfkvihtrxntjgeboi.supabase.co";
      const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnZmdma3ZpaHRyeG50amdlYm9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTk5NDAsImV4cCI6MjA1OTk3NTk0MH0.XtJ9_KniBKCHJtSC-2owq-8ZTecW56jx36LmS7DwjMM";
      
      const healthCheck = await Promise.race([
        fetch(`${supabaseUrl}/rest/v1/`, {
          headers: {
            'apikey': supabaseKey,
            'Content-Type': 'application/json'
          }
        }),
        timeout(3000)
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
        timeout(3000).then(() => { throw new Error('Timeout de connexion') })
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
        timeout(3000).then(() => { throw new Error('Timeout de connexion') })
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
        timeout(2000)
      ]);
      
      if (sessionCheck && typeof sessionCheck === 'object' && 'data' in (sessionCheck as object)) {
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
    
    // Méthode 1: Test direct avec fetch et timeout
    try {
      const supabaseUrl = "https://ggfgfkvihtrxntjgeboi.supabase.co";
      const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnZmdma3ZpaHRyeG50amdlYm9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTk5NDAsImV4cCI6MjA1OTk3NTk0MH0.XtJ9_KniBKCHJtSC-2owq-8ZTecW56jx36LmS7DwjMM";
      
      const response = await Promise.race([
        fetch(`${supabaseUrl}/rest/v1/`, {
          headers: {
            'apikey': supabaseKey,
            'Content-Type': 'application/json'
          }
        }),
        timeout(2500)
      ]);
      
      if (response instanceof Response && response.ok) {
        console.log("Connexion Supabase réussie via test HTTP rapide");
        return true;
      }
    } catch (e) {
      console.warn("Méthode 1 échouée:", e);
    }
    
    // Méthode 2: Test sur la table statuts avec un timeout court
    try {
      const { data, error } = await Promise.race([
        supabase.from('statuts').select('count').limit(1).maybeSingle(),
        timeout(2500)
      ]) as any;
      
      if (!error && data) {
        console.log("Connexion Supabase réussie via requête statuts");
        return true;
      }
    } catch (e) {
      console.warn("Méthode 2 échouée:", e);
    }
    
    // Méthode 3: Simple vérification de session
    try {
      const { data, error } = await Promise.race([
        supabase.auth.getSession(),
        timeout(2000)
      ]) as any;
      
      if (!error) {
        console.log("Connexion Supabase réussie via auth.getSession");
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
