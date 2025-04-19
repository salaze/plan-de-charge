
import { MonthData } from '@/types';
import { toast } from 'sonner';
import { saveEmployee } from './employees';
import { saveScheduleEntry, deleteScheduleEntry } from './schedule';

export const syncWithSupabase = async (data: MonthData) => {
  try {
    // First, synchronize employees
    for (const employee of data.employees) {
      await saveEmployee(employee);
      
      // Then sync their schedule
      for (const scheduleItem of employee.schedule) {
        if (scheduleItem.status === '') {
          await deleteScheduleEntry(employee.id, scheduleItem.date, scheduleItem.period);
        } else {
          await saveScheduleEntry(employee.id, scheduleItem);
        }
      }
    }
    
    toast.success('Données synchronisées avec Supabase');
    return true;
  } catch (error) {
    console.error('Error synchronizing with Supabase:', error);
    toast.error('Erreur lors de la synchronisation avec Supabase');
    return false;
  }
};
