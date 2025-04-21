
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

export const checkSupabaseConnection = async () => {
  try {
    console.log("Vérification de la connexion à Supabase...");
    
    // Utiliser un mécanisme de timeout pour éviter des attentes trop longues
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes de timeout
    
    // Test simple pour vérifier la connexion
    const { data, error } = await supabase
      .from('employes')
      .select('count()', { count: 'exact' })
      .limit(1)
      .abortSignal(controller.signal);
      
    clearTimeout(timeoutId);
    
    if (error) {
      console.error("Erreur de connexion Supabase:", error);
      throw error;
    }
    
    console.log("Connexion à Supabase établie avec succès");
    return true;
  } catch (error) {
    console.error('Erreur de vérification de connexion Supabase:', error);
    
    // Message plus explicite pour l'utilisateur
    if (error instanceof DOMException && error.name === 'AbortError') {
      toast.error('Délai de connexion à Supabase dépassé. Vérifiez votre connexion internet.');
    } else {
      toast.error('Erreur de connexion à la base de données.');
    }
    
    return false;
  }
};
