
import { MonthData } from '@/types';
import { syncWithSupabase } from '@/utils/supabase/sync';
import { toast } from 'sonner';

export const usePlanningSync = (data: MonthData) => {
  const saveDataToLocalStorage = (updatedData: MonthData) => {
    localStorage.setItem('planningData', JSON.stringify(updatedData));
  };

  const handleSync = async () => {
    try {
      await syncWithSupabase(data);
      saveDataToLocalStorage(data);
      return true;
    } catch (error) {
      console.error('Error synchronizing data:', error);
      toast.error('Erreur lors de la synchronisation des données');
      return false;
    }
  };

  return { saveDataToLocalStorage, handleSync };
};
