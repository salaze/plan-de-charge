
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useRealtimeSync = (isConnected: boolean, onDataChange: () => void) => {
  useEffect(() => {
    if (!isConnected) return;

    const statusChannel = supabase
      .channel('statuses-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'statuts'
        },
        (payload) => {
          console.log('Changement de statut détecté:', payload);
          toast.info('Données de statut mises à jour sur le serveur, actualisation...');
          onDataChange();
        }
      )
      .subscribe();
      
    const employeesChannel = supabase
      .channel('employees-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employes'
        },
        (payload) => {
          console.log('Changement d\'employé détecté:', payload);
          toast.info('Données d\'employé mises à jour sur le serveur, actualisation...');
          onDataChange();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(statusChannel);
      supabase.removeChannel(employeesChannel);
    };
  }, [isConnected, onDataChange]);
};
