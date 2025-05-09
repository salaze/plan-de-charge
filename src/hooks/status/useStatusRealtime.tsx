
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useStatusRealtime(onStatusUpdate: () => void) {
  // Setup Supabase real-time listener
  useEffect(() => {
    console.log("Setting up Supabase real-time listener for status changes");
    
    // Set up Supabase real-time changes listener
    const channel = supabase
      .channel('statuts-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'statuts' },
        (payload) => {
          console.log("Status table change detected:", payload);
          // Add slight delay to prevent UI jank
          setTimeout(() => {
            onStatusUpdate();
          }, 500);
        }
      )
      .subscribe();
    
    // Clean up on unmount
    return () => {
      console.log("Cleaning up Supabase real-time listener");
      supabase.removeChannel(channel);
    };
  }, [onStatusUpdate]);
}
