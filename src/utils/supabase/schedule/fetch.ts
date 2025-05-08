
import { supabase } from "@/integrations/supabase/client";
import { DayStatus } from '@/types';

/**
 * Fetches schedule entries for a specific employee
 */
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
