
import { supabase } from "@/integrations/supabase/client";

/**
 * Deletes a schedule entry for an employee
 */
export const deleteScheduleEntry = async (
  employeeId: string, 
  date: string, 
  period: string
) => {
  try {
    console.log(`Suppression d'une entrée de planning pour l'employé ${employeeId} à la date ${date}, période ${period}`);
    
    try {
      const { error } = await supabase
        .from('employe_schedule')
        .delete()
        .match({
          employe_id: employeeId,
          date,
          period
        });
        
      if (error) {
        console.error('Erreur lors de la suppression:', error);
        throw error;
      }
      
      console.log('Entrée de planning supprimée avec succès');
      
      // Dispatch an event to notify that a schedule entry has been deleted
      const event = new CustomEvent('scheduleEntryDeleted', { 
        detail: { employeeId, date, period } 
      });
      window.dispatchEvent(event);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      
      // En cas d'erreur d'autorisation, on essaie de vérifier si les politiques RLS sont activées
      if (error instanceof Error && error.message.includes('row-level security')) {
        console.warn("Problème possible avec les politiques RLS. Tentative de mise à jour forcée...");
        
        // Tentative de réinitialisation de la connexion
        await supabase.auth.refreshSession();
        
        // Nouvelle tentative après réinitialisation
        const { error: retryError } = await supabase
          .from('employe_schedule')
          .delete()
          .match({
            employe_id: employeeId,
            date,
            period
          });
          
        if (retryError) {
          console.error('Erreur persistante après tentative de récupération:', retryError);
          throw retryError;
        }
        
        console.log("Suppression réussie après erreur RLS initiale");
        return true;
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'entrée de planning:', error);
    throw error;
  }
};
