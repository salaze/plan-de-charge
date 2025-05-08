
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

export const checkSupabaseConnection = async () => {
  try {
    console.log("Vérification de la connexion à Supabase...");
    
    // Reduce timeout to fail faster if there's no connection
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout
    
    // Simple test to verify connection
    const { data, error } = await supabase
      .from('statuts')  // Using 'statuts' instead of 'employes' with count
      .select('*')
      .limit(1)
      .abortSignal(controller.signal);
      
    clearTimeout(timeoutId);
    
    if (error) {
      console.error("Erreur de connexion Supabase:", error);
      throw error;
    }
    
    // Nouveau: vérifier également l'accès à employe_schedule après mise à jour RLS
    const { data: scheduleData, error: scheduleError } = await supabase
      .from('employe_schedule')
      .select('id')
      .limit(1);
      
    if (scheduleError) {
      console.error("Erreur d'accès à employe_schedule:", scheduleError);
      // Ne pas échouer ici, car la connexion principale est établie
      toast.warning("Connexion établie mais des accès aux données peuvent être limités");
    } else {
      console.log("Accès à employe_schedule vérifié avec succès");
    }
    
    console.log("Connexion à Supabase établie avec succès");
    return true;
  } catch (error) {
    console.error('Erreur de vérification de connexion Supabase:', error);
    
    // More descriptive error message for the user
    if (error instanceof DOMException && error.name === 'AbortError') {
      toast.error('Délai de connexion à Supabase dépassé. Vérifiez votre connexion internet.');
    } else {
      toast.error('Erreur de connexion à la base de données. Application en mode dégradé.');
    }
    
    return false;
  }
};
