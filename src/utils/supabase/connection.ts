
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

export const checkSupabaseConnection = async () => {
  try {
    console.log("Vérification de la connexion à Supabase...");
    
    // Reduce timeout to fail faster if there's no connection
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // Réduit de 5s à 3s pour une détection plus rapide
    
    // Simple test to verify connection - utilisez une requête plus légère
    const { count, error } = await supabase
      .from('statuts')
      .select('*', { count: 'exact', head: true })
      .abortSignal(controller.signal);
      
    clearTimeout(timeoutId);
    
    if (error) {
      console.error("Erreur de connexion Supabase:", error);
      return false;
    }
    
    console.log("Connexion à Supabase établie avec succès");
    return true;
  } catch (error) {
    console.error('Erreur de vérification de connexion Supabase:', error);
    
    // Ne pas afficher automatiquement le toast ici - laissez le composant gérer cela
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.warn('Délai de connexion à Supabase dépassé.');
    }
    
    return false;
  }
};
