
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export function useStatusEvents(onStatusesUpdated: () => void) {
  const lastUpdateTimestampRef = useRef<number>(0);
  const isProcessingRef = useRef<boolean>(false);
  const debounceTimeRef = useRef<number>(3000); // Augmenté à 3 secondes pour un debounce plus strict

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
        
        // Reset processing flag after a longer cooldown period
        setTimeout(() => {
          isProcessingRef.current = false;
        }, 2000);
      }, 500);
    };
    
    // Listen for Supabase real-time events with debounce
    let realtimeEventTimeout: number | null = null;
    const channel = supabase
      .channel('status-options-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'statuts'
        },
        (payload: RealtimePostgresChangesPayload<{[key: string]: any}>) => {
          console.log('Status change detected from database:', payload);
          
          // Clear any pending timeout
          if (realtimeEventTimeout) {
            clearTimeout(realtimeEventTimeout);
          }
          
          // Debounce the event processing
          realtimeEventTimeout = window.setTimeout(() => {
            processStatusUpdate();
            realtimeEventTimeout = null;
          }, 1000);
        }
      )
      .subscribe((status) => {
        if (status !== 'SUBSCRIBED') {
          console.log(`Status options realtime subscription status: ${status}`);
        }
      });

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
      
      if (realtimeEventTimeout) {
        clearTimeout(realtimeEventTimeout);
      }
    };
  }, [onStatusesUpdated]);
}
