
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Fonction pour vérifier l'existence d'une table
export async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from(tableName as any)
      .select('*')
      .limit(1);
    
    // Si on peut faire un select sans erreur, la table existe
    if (error) {
      console.error(`La table ${tableName} est inaccessible:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Erreur lors de la vérification de la table ${tableName}:`, error);
    return false;
  }
}

// Fonction pour vérifier si les statuts peuvent être enregistrés
export async function ensureStatusesCanBeSaved(): Promise<boolean> {
  try {
    // Vérifier si la table existe
    const tableExists = await checkTableExists('statuts');
    
    if (!tableExists) {
      console.error("La table des statuts n'est pas accessible");
      toast.error("La table des statuts n'est pas accessible dans Supabase");
      return false;
    }
    
    // Tester l'insertion d'un statut de test
    const testId = crypto.randomUUID();
    const { error: insertError } = await supabase
      .from('statuts')
      .insert({
        id: testId,
        code: 'test',
        libelle: 'Test de connexion',
        couleur: 'bg-gray-500 text-white',
        display_order: 9999
      });
    
    // Supprimer le statut de test
    if (!insertError) {
      await supabase
        .from('statuts')
        .delete()
        .eq('id', testId);
      
      console.log("Test d'insertion de statut réussi");
      return true;
    } else {
      console.error("Impossible d'insérer un statut test:", insertError);
      return false;
    }
  } catch (error) {
    console.error("Erreur lors de la vérification de la table des statuts:", error);
    toast.error("Erreur lors de la vérification de la table des statuts");
    return false;
  }
}
