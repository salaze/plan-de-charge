
import { MonthData } from '@/types';
import { syncWithSupabase } from '@/utils/supabase/sync';
import { toast } from 'sonner';

export const usePlanningSync = (data: MonthData) => {
  const handleSync = async () => {
    try {
      await syncWithSupabase(data);
      toast.success('Données synchronisées avec Supabase');
      return true;
    } catch (error) {
      console.error('Error synchronizing data:', error);
      toast.error('Erreur lors de la synchronisation des données avec Supabase');
      return false;
    }
  };

  return { handleSync };
};
