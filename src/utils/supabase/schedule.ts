
import { supabase } from "@/integrations/supabase/client";
import { DayStatus } from '@/types';

export const fetchSchedule = async (employeeId: string) => {
  try {
    console.log(`Récupération du planning pour l'employé ${employeeId}`);
    
    const { data, error } = await supabase
      .from('employe_schedule')
      .select('*')
      .eq('employe_id', employeeId);
      
    if (error) {
      console.error('Erreur Supabase:', error);
      throw error;
    }
    
    const schedule = data.map(item => ({
      date: item.date,
      status: item.statut_code,
      period: item.period,
      note: item.note,
      projectCode: item.project_code,
      isHighlighted: item.is_highlighted
    })) as DayStatus[];
    
    console.log(`Récupération de ${schedule.length} entrées de planning pour l'employé ${employeeId}`);
    return schedule;
  } catch (error) {
    console.error('Error fetching schedule:', error);
    throw error;
  }
};

export const saveScheduleEntry = async (
  employeeId: string, 
  entry: DayStatus
) => {
  try {
    console.log(`Sauvegarde d'une entrée de planning pour l'employé ${employeeId}:`, entry);
    
    const { error } = await supabase
      .from('employe_schedule')
      .upsert({
        employe_id: employeeId,
        date: entry.date,
        statut_code: entry.status,
        period: entry.period,
        note: entry.note || null,
        project_code: entry.projectCode || null,
        is_highlighted: entry.isHighlighted || false
      });
      
    if (error) {
      console.error('Erreur Supabase lors de la sauvegarde:', error);
      throw error;
    }
    
    console.log(`Entrée de planning sauvegardée avec succès pour l'employé ${employeeId}`);
    
    // Dispatch an event to notify that the schedule has been updated
    const event = new CustomEvent('scheduleEntryUpdated', { 
      detail: { employeeId, entry } 
    });
    window.dispatchEvent(event);
    
    return true;
  } catch (error) {
    console.error('Error saving schedule entry:', error);
    throw error;
  }
};

export const deleteScheduleEntry = async (
  employeeId: string, 
  date: string, 
  period: string
) => {
  try {
    console.log(`Suppression d'une entrée de planning pour l'employé ${employeeId} à la date ${date}, période ${period}`);
    
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
    console.error('Erreur lors de la suppression de l\'entrée de planning:', error);
    throw error;
  }
};

// Ajouter une fonction pour vérifier si un projet existe dans la base de données
export const checkProjectExists = async (projectCode: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('projets')
      .select('code')
      .eq('code', projectCode)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // Code d'erreur "No rows returned" de PostgREST
        return false;
      }
      throw error;
    }
    
    return !!data;
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'existence du projet:', error);
    return false;
  }
};
