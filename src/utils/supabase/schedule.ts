
import { supabase } from "@/integrations/supabase/client";
import { DayStatus } from '@/types';

export const fetchSchedule = async (employeeId: string) => {
  try {
    const { data, error } = await supabase
      .from('employe_schedule')
      .select('*')
      .eq('employe_id', employeeId);
      
    if (error) throw error;
    
    return data.map(item => ({
      date: item.date,
      status: item.statut_code,
      period: item.period,
      note: item.note,
      projectCode: item.project_code,
      isHighlighted: item.is_highlighted
    })) as DayStatus[];
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
      
    if (error) throw error;
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
    const { error } = await supabase
      .from('employe_schedule')
      .delete()
      .match({
        employe_id: employeeId,
        date,
        period
      });
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting schedule entry:', error);
    throw error;
  }
};
