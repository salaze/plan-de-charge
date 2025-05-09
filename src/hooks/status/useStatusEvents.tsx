
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useStatusEvents(onStatusesUpdated: () => void) {
  useEffect(() => {
    // Référence pour éviter les doubles appels rapprochés
    let lastUpdateTimestamp = 0;
    const debounceTime = 1000; // 1 seconde de délai
    
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
          const now = Date.now();
          if (now - lastUpdateTimestamp > debounceTime) {
            lastUpdateTimestamp = now;
            setTimeout(() => {
              onStatusesUpdated();
            }, 1000);
          } else {
            console.log("Mise à jour ignorée (trop rapide)");
          }
        }
      )
      .subscribe();

    const handleStatusesUpdated = (event: Event) => {
      const customEvent = event as CustomEvent;
      const fromSync = customEvent.detail?.fromSync === true;
      const noRefresh = customEvent.detail?.noRefresh === true;
      
      // Ignorer les événements provenant directement de la synchronisation
      if (noRefresh || fromSync) {
        console.log("Événement ignoré pour éviter une boucle");
        return;
      }
      
      const now = Date.now();
      if (now - lastUpdateTimestamp > debounceTime) {
        lastUpdateTimestamp = now;
        console.log("Rechargement des options de statut suite à un événement");
        onStatusesUpdated();
      } else {
        console.log("Mise à jour ignorée (trop rapide)");
      }
    };
    
    window.addEventListener('statusesUpdated', handleStatusesUpdated);
    
    return () => {
      window.removeEventListener('statusesUpdated', handleStatusesUpdated);
      supabase.removeChannel(channel);
    };
  }, [onStatusesUpdated]);
}
