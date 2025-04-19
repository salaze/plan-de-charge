
import { supabase } from "@/integrations/supabase/client";
import { DayStatus } from '@/types';
import { getOfflineMode } from './connection';

export const fetchSchedule = async (employeeId: string) => {
  if (getOfflineMode()) {
    const savedData = localStorage.getItem('planningData');
    if (savedData) {
      const data = JSON.parse(savedData);
      const employee = data.employees.find((emp: any) => emp.id === employeeId);
      return employee?.schedule || [];
    }
    return [];
  }
  
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
    
    const savedData = localStorage.getItem('planningData');
    if (savedData) {
      const data = JSON.parse(savedData);
      const employee = data.employees.find((emp: any) => emp.id === employeeId);
      return employee?.schedule || [];
    }
    return [];
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
    return false;
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
    return false;
  }
};
