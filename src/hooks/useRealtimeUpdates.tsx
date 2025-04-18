import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types';

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

export function useRealtimeEmployees() {
  const [updates, setUpdates] = useState<Employee[]>([]);

  useEffect(() => {
    const channel = supabase
      .channel('employees-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'employes'
        },
        (payload) => {
          console.log('New employee:', payload);
          const employee: Employee = {
            id: payload.new.id,
            name: payload.new.nom,
            email: payload.new.identifiant,
            position: payload.new.fonction,
            department: payload.new.departement,
            role: payload.new.role || 'employee',
            uid: payload.new.uid,
            schedule: []
          };
          setUpdates(prev => [...prev, employee]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return updates;
}

export function useRealtimeStatuses() {
  const [updates, setUpdates] = useState<any[]>([]);

  useEffect(() => {
    const channel = supabase
      .channel('statuses-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'statuts'
        },
        (payload) => {
          console.log('New status:', payload);
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
