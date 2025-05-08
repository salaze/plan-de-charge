
import { supabase } from "@/integrations/supabase/client";
import { DayStatus } from '@/types';
import { checkProjectExists } from './validate';
import { ScheduleEntry } from './types';

/**
 * Saves a schedule entry for an employee
 */
export const saveScheduleEntry = async (
  employeeId: string, 
  entry: DayStatus
) => {
  try {
    console.log(`Sauvegarde d'une entrée de planning pour l'employé ${employeeId}:`, entry);
    
    // Vérifier que toutes les données nécessaires sont présentes
    if (!entry.date || !entry.period || !entry.status) {
      console.error("Données de planning incomplètes pour la sauvegarde:", entry);
      return false;
    }
    
    // Si c'est un statut de projet, vérifier que le projet existe
    if (entry.status === 'projet' && entry.projectCode) {
      const projectExists = await checkProjectExists(entry.projectCode);
      if (!projectExists) {
        console.error(`Le projet ${entry.projectCode} n'existe pas dans la base de données`);
        return false;
      }
    }
    
    // Préparation des données à sauvegarder
    const scheduleData: ScheduleEntry = {
      employe_id: employeeId,
      date: entry.date,
      statut_code: entry.status,
      period: entry.period,
      note: entry.note || null,
      project_code: entry.projectCode || null,
      is_highlighted: entry.isHighlighted || false
    };
    
    console.log("Données préparées pour Supabase:", scheduleData);
    
    // Vérifier si l'entrée existe déjà
    const { data: existingData, error: checkError } = await supabase
      .from('employe_schedule')
      .select('id')
      .eq('employe_id', employeeId)
      .eq('date', entry.date)
      .eq('period', entry.period)
      .maybeSingle();
    
    if (checkError) {
      console.error('Erreur lors de la vérification de l\'existence de l\'entrée:', checkError);
      throw checkError;
    }
    
    let result;
    
    try {
      if (existingData) {
        // Mise à jour d'une entrée existante
        console.log(`Mise à jour de l'entrée existante avec ID: ${existingData.id}`);
        result = await supabase
          .from('employe_schedule')
          .update(scheduleData)
          .eq('id', existingData.id)
          .select();
      } else {
        // Insertion d'une nouvelle entrée
        console.log('Création d\'une nouvelle entrée de planning');
        result = await supabase
          .from('employe_schedule')
          .insert(scheduleData)
          .select();
      }
      
      if (result.error) {
        console.error('Erreur Supabase lors de la sauvegarde:', result.error);
        throw result.error;
      }
      
      console.log(`Entrée de planning sauvegardée avec succès pour l'employé ${employeeId}`, result.data);
      
      // Dispatch an event to notify that the schedule has been updated
      const event = new CustomEvent('scheduleEntryUpdated', { 
        detail: { employeeId, entry, response: result.data } 
      });
      window.dispatchEvent(event);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      
      // En cas d'erreur d'autorisation, on essaie de vérifier si les politiques RLS sont activées
      if (error instanceof Error && error.message.includes('row-level security')) {
        console.warn("Problème possible avec les politiques RLS. Tentative de mise à jour forcée...");
        
        // Tentative de réinitialisation de la connexion
        await supabase.auth.refreshSession();
        
        // Nouvelle tentative après réinitialisation
        if (existingData) {
          result = await supabase
            .from('employe_schedule')
            .update(scheduleData)
            .eq('id', existingData.id);
        } else {
          result = await supabase
            .from('employe_schedule')
            .insert(scheduleData);
        }
        
        if (result.error) {
          console.error('Erreur persistante après tentative de récupération:', result.error);
          throw result.error;
        }
        
        console.log("Récupération réussie après erreur RLS initiale");
        return true;
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Error saving schedule entry:', error);
    throw error;
  }
};
