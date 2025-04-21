
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Employee, StatusCode } from '@/types';
import { toast } from 'sonner';

// All these hooks are now only used for internal state updates
// and have been enhanced with better error reporting

export function useRealtimeEmployeeSchedule() {
  const [updates, setUpdates] = useState<any[]>([]);

  useEffect(() => {
    try {
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
            toast.info(`Nouvelle entrée de planning détectée`);
            setUpdates(prev => [...prev, payload.new]);
          }
        )
        .subscribe((status) => {
          if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
            console.error(`Realtime subscription error: ${status}`);
            toast.error('Erreur de connexion en temps réel pour le planning');
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.error('Failed to subscribe to realtime updates:', error);
      return () => {};
    }
  }, []);

  return updates;
}

export function useRealtimeEmployees() {
  const [updates, setUpdates] = useState<Employee[]>([]);

  useEffect(() => {
    try {
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
            toast.info(`Nouvel employé détecté: ${payload.new.nom}`);
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
        .subscribe((status) => {
          if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
            console.error(`Realtime subscription error: ${status}`);
            toast.error('Erreur de connexion en temps réel pour les employés');
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.error('Failed to subscribe to realtime updates:', error);
      return () => {};
    }
  }, []);

  return updates;
}

export function useRealtimeStatuses() {
  const [updates, setUpdates] = useState<{
    id: string;
    code: StatusCode;
    libelle: string;
    couleur: string;
  }[]>([]);

  useEffect(() => {
    try {
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
            toast.info(`Nouveau statut détecté: ${payload.new.libelle}`);
            setUpdates(prev => [...prev, {
              id: payload.new.id,
              code: payload.new.code,
              libelle: payload.new.libelle,
              couleur: payload.new.couleur
            }]);
          }
        )
        .subscribe((status) => {
          if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
            console.error(`Realtime subscription error: ${status}`);
            toast.error('Erreur de connexion en temps réel pour les statuts');
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.error('Failed to subscribe to realtime updates:', error);
      return () => {};
    }
  }, []);

  return updates;
}
