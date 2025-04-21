
import { MonthData } from '@/types';
import { syncWithSupabase } from '@/utils/supabase/sync';
import { toast } from 'sonner';
import { useState } from 'react';

export const usePlanningSync = (data: MonthData) => {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    if (isSyncing) {
      toast.info('Synchronisation déjà en cours...');
      return false;
    }

    try {
      setIsSyncing(true);
      toast.info('Synchronisation avec Supabase en cours...');
      
      await syncWithSupabase(data);
      
      toast.success('Données synchronisées avec Supabase');
      return true;
    } catch (error) {
      console.error('Error synchronizing data:', error);
      toast.error('Erreur lors de la synchronisation des données avec Supabase');
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  return { handleSync, isSyncing };
};
