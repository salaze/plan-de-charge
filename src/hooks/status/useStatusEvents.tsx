
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useStatusEvents(onStatusesUpdated: () => void) {
  const lastUpdateTimestampRef = useRef<number>(0);
  const isProcessingRef = useRef<boolean>(false);
  const debounceTimeRef = useRef<number>(1500); // 1.5 seconds debounce

  useEffect(() => {
    console.log("useStatusEvents: Setting up event listeners");
    
    const processStatusUpdate = () => {
      if (isProcessingRef.current) {
        console.log("Status update already being processed, skipped");
        return;
      }
      
      const now = Date.now();
      if (now - lastUpdateTimestampRef.current < debounceTimeRef.current) {
        console.log("Update ignored (too rapid)");
        return;
      }
      
      lastUpdateTimestampRef.current = now;
      isProcessingRef.current = true;
      
      // Add slight delay to allow UI to stabilize
      setTimeout(() => {
        console.log("Processing status update...");
        onStatusesUpdated();
        
        // Reset processing flag after a cooldown period
        setTimeout(() => {
          isProcessingRef.current = false;
        }, 1000);
      }, 300);
    };
    
    // Listen for Supabase real-time events
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
          console.log('Status change detected, updating options:', payload);
          processStatusUpdate();
        }
      )
      .subscribe();

    // Listen for custom events
    const handleStatusesUpdated = (event: Event) => {
      const customEvent = event as CustomEvent;
      const fromSync = customEvent.detail?.fromSync === true;
      const noRefresh = customEvent.detail?.noRefresh === true;
      
      // Ignore events from sync or with noRefresh flag
      if (noRefresh || fromSync) {
        console.log("Event ignored to prevent loop");
        return;
      }
      
      console.log("Status update event received");
      processStatusUpdate();
    };
    
    window.addEventListener('statusesUpdated', handleStatusesUpdated);
    
    return () => {
      console.log("useStatusEvents: Cleaning up event listeners");
      window.removeEventListener('statusesUpdated', handleStatusesUpdated);
      supabase.removeChannel(channel);
    };
  }, [onStatusesUpdated]);
}
