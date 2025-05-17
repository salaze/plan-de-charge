
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { queryClient } from '@/contexts/QueryContext';
import { toast } from 'sonner';

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
    
    // Créer un canal pour la table
    const channel = supabase.channel(`watch_${tableName}`);
    
    // Configurer l'écoute des événements Postgres avec la syntaxe correcte
    const subscription = channel.on(
      'postgres_changes', 
      { 
        event: eventType, 
        schema: 'public', 
        table: tableName 
      }, 
      (payload) => {
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
        
        // Invalider les requêtes pour forcer un rechargement
        queryClient.invalidateQueries({ queryKey });
      }
    );
    
    // S'abonner au canal après avoir défini tous les écouteurs
    subscription.subscribe((status) => {
      console.log(`Subscription status for ${tableName}: ${status}`);
      if (status === 'SUBSCRIBED') {
        console.log(`Successfully subscribed to ${tableName} changes`);
      } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
        console.error(`Error subscribing to ${tableName} changes: ${status}`);
      }
    });
      
    // Nettoyage lors du démontage
    return () => {
      console.log(`Cleaning up subscription for ${tableName}`);
      supabase.removeChannel(channel);
    };
  }, [tableName, queryKey.join(','), eventType, showNotifications]);
};
