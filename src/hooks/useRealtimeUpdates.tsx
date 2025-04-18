
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useRealtimeEmployeeSchedule() {
  const [updates, setUpdates] = useState<any[]>([]);

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'employe_schedule'
        },
        (payload) => {
          console.log('New schedule entry:', payload);
          setUpdates(prev => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return updates;
}
