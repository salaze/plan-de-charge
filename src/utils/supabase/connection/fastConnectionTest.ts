
import { supabase } from '@/integrations/supabase/client';

/**
 * Effectue une vérification optimisée et rapide de la connexion 
 * avec plusieurs mécanismes de repli
 */
export async function checkSupabaseConnectionFast(): Promise<boolean> {
  try {
    console.log("Vérification rapide de la connexion Supabase...");
    
    // Ajouter un timeout pour éviter les attentes trop longues
    const timeout = (ms: number) => new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), ms)
    );
    
    // Essai simple: Vérifier la table statuts (la plus légère)
    try {
      const { data, error } = await Promise.race([
        supabase
          .from('statuts')
          .select('count')
          .limit(1)
          .single(),
        timeout(3000)
      ]) as any;
      
      if (!error && data) {
        console.log("Connexion Supabase réussie via table statuts");
        return true;
      }
    } catch (e) {
      console.warn("Premier test échoué, tentative avec auth.getSession", e);
    }
    
    // Essai alternatif: Vérifier la session
    try {
      const { data } = await Promise.race([
        supabase.auth.getSession(),
        timeout(2000)
      ]) as any;
      
      if (data && data.session) {
        console.log("Connexion Supabase réussie via auth.getSession");
        return true;
      }
    } catch (e) {
      console.error("Échec du second test:", e);
    }
    
    console.error("Tous les tests de connexion ont échoué");
    return false;
  } catch (error) {
    console.error("Exception lors du test de connexion Supabase:", error);
    return false;
  }
}
