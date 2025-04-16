
import { supabase } from '@/integrations/supabase/client';

/**
 * Effectue une vérification optimisée et rapide de la connexion 
 * avec plusieurs mécanismes de repli
 */
export async function checkSupabaseConnectionFast(): Promise<boolean> {
  try {
    console.log("Vérification rapide de la connexion Supabase...");
    
    // Ajouter un timeout pour éviter les attentes trop longues
    const timeout = <T>(ms: number): Promise<T> => new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), ms)
    );
    
    // Essais en parallèle avec race condition pour une vérification plus rapide
    const tests = [
      // Test 1: Vérifier la table statuts (la plus légère)
      (async () => {
        try {
          const result = await Promise.race([
            supabase
              .from('statuts')
              .select('count')
              .limit(1)
              .single(),
            timeout<never>(3000)
          ]) as { data: any, error: any };
          
          if (!result.error && result.data) {
            console.log("Connexion Supabase réussie via table statuts");
            return true;
          }
          return false;
        } catch (e) {
          console.warn("Premier test échoué", e);
          return false;
        }
      })(),
      
      // Test 2: Vérifier la session
      (async () => {
        try {
          const result = await Promise.race([
            supabase.auth.getSession(),
            timeout<never>(2000)
          ]) as { data: { session: any } | null };
          
          if (result.data && result.data.session) {
            console.log("Connexion Supabase réussie via auth.getSession");
            return true;
          }
          return false;
        } catch (e) {
          console.warn("Second test échoué", e);
          return false;
        }
      })(),
      
      // Test 3: Vérification alternative si les deux premiers échouent
      (async () => {
        try {
          // First convert to unknown, then to a Promise to handle the type correctly
          const rpcPromise = supabase.rpc('get_service_status') as unknown as Promise<{
            data: { count: number } | null;
            error: any;
          }>;
          
          const result = await Promise.race([
            rpcPromise,
            timeout<never>(1500)
          ]);
          
          if (result && result.data && result.data.count !== undefined) {
            console.log("Connexion Supabase réussie via RPC");
            return true;
          }
          return false;
        } catch (e) {
          console.warn("Troisième test échoué", e);
          return false;
        }
      })()
    ];
    
    // Attendre le premier test réussi, ou tous les échecs
    const results = await Promise.all(tests);
    const isConnected = results.some(result => result === true);
    
    if (isConnected) {
      return true;
    }
    
    console.warn("Tous les tests de connexion ont échoué");
    return false;
  } catch (error) {
    console.error("Exception lors du test de connexion Supabase:", error);
    return false;
  }
}
