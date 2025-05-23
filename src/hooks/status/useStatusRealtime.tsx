
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export function useStatusRealtime(onStatusUpdate: () => void) {
  // Setup Supabase real-time listener
  useEffect(() => {
    console.log("Setting up Supabase real-time listener for status changes");
    
    // Set up Supabase real-time changes listener
    const channel = supabase
      .channel('statuts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'statuts'
        },
        (payload: RealtimePostgresChangesPayload<{[key: string]: any}>) => {
          console.log("Status table change detected:", payload);
          // Add slight delay to prevent UI jank
          setTimeout(() => {
            onStatusUpdate();
          }, 500);
        }
      )
      .subscribe((status) => {
        if (status !== 'SUBSCRIBED') {
          console.log(`Status realtime subscription status: ${status}`);
        }
      });
    
    // Clean up on unmount
    return () => {
      console.log("Cleaning up Supabase real-time listener");
      supabase.removeChannel(channel);
    };
  }, [onStatusUpdate]);
}
