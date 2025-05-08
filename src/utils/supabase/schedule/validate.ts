
import { supabase } from "@/integrations/supabase/client";

/**
 * Verifies if a project exists in the database
 */
export const checkProjectExists = async (projectCode: string): Promise<boolean> => {
  try {
    if (!projectCode) {
      console.error("Code de projet vide");
      return false;
    }
    
    console.log(`Vérification de l'existence du projet avec le code: ${projectCode}`);
    
    const { data, error } = await supabase
      .from('projets')
      .select('code')
      .eq('code', projectCode)
      .limit(1);
      
    if (error) {
      console.error('Erreur lors de la vérification du projet:', error);
      return false;
    }
    
    const exists = data && data.length > 0;
    console.log(`Projet ${projectCode} existe: ${exists}`);
    return exists;
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'existence du projet:', error);
    return false;
  }
};
