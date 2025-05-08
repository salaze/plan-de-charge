
import { supabase } from "@/integrations/supabase/client";

/**
 * Tests RLS connection to ensure proper access
 */
export const testRLSConnection = async (): Promise<boolean> => {
  try {
    console.log("Test de connexion RLS...");
    
    // Tester une simple opération de lecture pour vérifier les RLS
    const { data, error } = await supabase
      .from('employe_schedule')
      .select('id')
      .limit(1);
      
    if (error) {
      console.error("Erreur de connexion RLS:", error);
      return false;
    }
    
    console.log("Connexion RLS OK");
    return true;
  } catch (error) {
    console.error("Erreur lors du test de connexion RLS:", error);
    return false;
  }
};
