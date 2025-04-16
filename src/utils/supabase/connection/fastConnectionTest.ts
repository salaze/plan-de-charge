
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
        createTimeout(5000) // Augmented timeout
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
        createTimeout(5000) // Augmented timeout
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
      const { data } = await supabase.auth.getSession();
      if (data && data.session) {
        console.log("Connexion Supabase réussie via auth.getSession");
        return true;
      }
    } catch (e) {
      console.warn("Méthode 3 échouée:", e);
    }
    
    console.warn("Toutes les méthodes de connexion ont échoué");
    return false;
  } catch (error) {
    console.error("Erreur lors de la vérification rapide:", error);
    return false;
  }
}
