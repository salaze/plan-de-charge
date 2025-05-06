
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types for our realtime event handlers
export interface RealtimeEventHandlers {
  onStatusChange?: (payload: any) => void;
  onEmployeeChange?: (payload: any) => void;
  onScheduleChange?: (payload: any) => void;
}

// Setup a realtime channel for statuses table
export const setupStatusChannel = (
  isEditingRef: { current: boolean },
  pendingRefreshRef: { current: boolean },
  onStatusChange?: (payload: any) => void
): RealtimeChannel => {
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
        
        // Ne pas rafraîchir si l'on est en mode édition
        if (isEditingRef.current) {
          console.log('Actualisation ignorée car en mode édition');
          // Marquer qu'un refresh sera nécessaire plus tard
          pendingRefreshRef.current = true;
          return;
        }
        
        // Pour les événements DELETE, toujours actualiser car cela peut affecter l'interface
        if (payload.eventType === 'DELETE') {
          toast.info('Statut supprimé sur le serveur, actualisation...');
          
          // Déclencher un événement personnalisé pour informer d'autres composants
          const event = new CustomEvent('statusesUpdated');
          window.dispatchEvent(event);
          
          if (onStatusChange) onStatusChange(payload);
        }
        
        // Pour INSERT ou UPDATE, attendre un peu pour ne pas interrompre l'interaction utilisateur
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          console.log('Nouveau statut ou mise à jour détectée, notification sans actualisation immédiate');
          toast.info('Mise à jour des statuts disponible');
          
          // Déclencher un événement pour informer sans forcer une actualisation
          const event = new CustomEvent('statusesUpdated', { detail: { noRefresh: true } });
          window.dispatchEvent(event);
        }
      }
    )
    .subscribe();
  
  return statusChannel;
};

// Setup a realtime channel for employees table
export const setupEmployeesChannel = (
  isEditingRef: { current: boolean },
  pendingRefreshRef: { current: boolean },
  onEmployeeChange?: (payload: any) => void
): RealtimeChannel => {
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
        // Ne pas rafraîchir si l'on est en mode édition
        if (isEditingRef.current) {
          console.log('Actualisation ignorée car en mode édition');
          // Marquer qu'un refresh sera nécessaire plus tard
          pendingRefreshRef.current = true;
          return;
        }
        
        console.log('Changement d\'employé détecté:', payload);
        toast.info('Données d\'employé mises à jour sur le serveur, actualisation...');
        if (onEmployeeChange) onEmployeeChange(payload);
      }
    )
    .subscribe();
  
  return employeesChannel;
};

// Setup a realtime channel for employee schedules table
export const setupScheduleChannel = (
  isEditingRef: { current: boolean },
  pendingRefreshRef: { current: boolean },
  onScheduleChange?: (payload: any) => void
): RealtimeChannel => {
  const scheduleChannel = supabase
    .channel('schedule-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'employe_schedule'
      },
      (payload) => {
        // Ne pas rafraîchir si l'on est en mode édition
        if (isEditingRef.current) {
          console.log('Actualisation du planning ignorée car en mode édition');
          // Marquer qu'un refresh sera nécessaire plus tard
          pendingRefreshRef.current = true;
          return;
        }
        
        console.log('Changement dans le planning détecté:', payload);
        
        // Notifier mais sans actualiser immédiatement pour éviter de perturber l'utilisateur
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          toast.info('Mise à jour du planning disponible');
        } else if (payload.eventType === 'DELETE') {
          toast.info('Entrée supprimée du planning, actualisation...');
          if (onScheduleChange) onScheduleChange(payload);
        }
      }
    )
    .subscribe();
  
  return scheduleChannel;
};

// Clean up all channels
export const cleanupChannels = (channels: RealtimeChannel[]): void => {
  channels.forEach(channel => {
    try {
      if (channel) {
        supabase.removeChannel(channel);
      }
    } catch (error) {
      console.error('Erreur lors du nettoyage du canal:', error);
    }
  });
};
