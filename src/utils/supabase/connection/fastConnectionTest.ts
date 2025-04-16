
import { supabase } from '@/integrations/supabase/client';
import { createTimeout, SUPABASE_URL, SUPABASE_KEY } from './connectionVerifier';

/**
 * Effectue une vérification optimisée et rapide de la connexion 
 * avec plusieurs mécanismes de repli
 */
export async function checkSupabaseConnectionFast(): Promise<boolean> {
  try {
    // Méthode 1: Test direct avec fetch et timeout plus long
    try {
      const response = await Promise.race([
        fetch(`${SUPABASE_URL}/rest/v1/`, {
          headers: {
            'apikey': SUPABASE_KEY,
            'Content-Type': 'application/json'
          }
        }),
        createTimeout(3500)
      ]);
      
      if (response instanceof Response && response.ok) {
        console.log("Connexion Supabase réussie via test HTTP rapide");
        return true;
      }
    } catch (e) {
      console.warn("Méthode 1 échouée:", e);
    }
    
    // Méthode 2: Test sur la table statuts avec un timeout plus long
    try {
      const { data, error } = await Promise.race([
        supabase.from('statuts').select('count').limit(1).maybeSingle(),
        createTimeout(3500)
      ]) as any;
      
      if (!error && data) {
        console.log("Connexion Supabase réussie via requête statuts");
        return true;
      }
    } catch (e) {
      console.warn("Méthode 2 échouée:", e);
    }
    
    // Méthode 3: Simple vérification de session avec timeout plus long
    try {
      const sessionResult = await Promise.race([
        supabase.auth.getSession(),
        createTimeout(3000)
      ]);
      
      // Type guard to check if sessionResult is an object with data property
      if (sessionResult && typeof sessionResult === 'object' && 'data' in sessionResult) {
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
