
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { queryClient } from '@/contexts/QueryContext';
import { toast } from 'sonner';
import type { RealtimeChannel } from '@supabase/supabase-js';

type TableName = 'employe_schedule' | 'statuts' | 'employes';
type EventType = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

// Hook pour s'abonner aux modifications d'une table et invalider les requêtes correspondantes
export const useSupabaseSubscription = (
  tableName: TableName,
  queryKey: string[],
  eventType: EventType = '*',
  showNotifications: boolean = true
) => {
  useEffect(() => {
    console.log(`Setting up subscription for ${tableName}, events: ${eventType}`);
    
    // Créer un canal pour la table avec un identifiant unique pour éviter les conflits
    const channelId = `watch_${tableName}_${Date.now()}`;
    const channel = supabase.channel(channelId);
    
    // Configurer l'écoute des événements Postgres avec la syntaxe correcte pour TypeScript
    channel
      .on('postgres_changes', {
        event: eventType,
        schema: 'public',
        table: tableName
      }, (payload) => {
        console.log(`Change detected in ${tableName}:`, payload);
        
        // Afficher une notification
        if (showNotifications) {
          const messages = {
            INSERT: 'Nouvelle entrée ajoutée',
            UPDATE: 'Données mises à jour',
            DELETE: 'Entrée supprimée'
          };
          
          toast.info(
            `${messages[payload.eventType as keyof typeof messages]} dans ${tableName}`, 
            { duration: 3000 }
          );
        }
        
        // Invalider les requêtes avec une légère pause pour éviter les surcharges
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey });
        }, 100);
      })
      .subscribe((status: string) => {
        console.log(`Subscription status for ${tableName}: ${status}`);
        if (status === 'SUBSCRIBED') {
          console.log(`Successfully subscribed to ${tableName} changes`);
        } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
          console.error(`Error subscribing to ${tableName} changes: ${status}`);
          
          // Tentative de reconnexion automatique
          setTimeout(() => {
            channel.subscribe();
          }, 5000);
        }
      });
      
    // Nettoyage lors du démontage avec timeout pour s'assurer que le canal est bien fermé
    return () => {
      console.log(`Cleaning up subscription for ${tableName}`);
      
      // Assurer que le canal est bien nettoyé
      try {
        supabase.removeChannel(channel);
      } catch (err) {
        console.error(`Error removing channel for ${tableName}:`, err);
      }
    };
  }, [tableName, queryKey.join(','), eventType, showNotifications]);
};
