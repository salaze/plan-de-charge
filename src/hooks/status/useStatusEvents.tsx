
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useStatusEvents(onStatusesUpdated: () => void) {
  useEffect(() => {
    const channel = supabase
      .channel('status-options-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'statuts'
        },
        (payload) => {
          console.log('Changement de statut détecté, actualisation des options:', payload);
          setTimeout(() => {
            onStatusesUpdated();
          }, 1000);
        }
      )
      .subscribe();

    const handleStatusesUpdated = (event: Event) => {
      const customEvent = event as CustomEvent;
      const noRefresh = customEvent.detail?.noRefresh === true;
      
      if (!noRefresh) {
        console.log("Rechargement des options de statut suite à un événement");
        onStatusesUpdated();
      }
    };
    
    window.addEventListener('statusesUpdated', handleStatusesUpdated);
    
    return () => {
      window.removeEventListener('statusesUpdated', handleStatusesUpdated);
      supabase.removeChannel(channel);
    };
  }, [onStatusesUpdated]);
}
