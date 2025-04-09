
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Using a flexible type to accommodate the connection_logs table until types are updated
type TableName = 'employes' | 'employe_schedule' | 'statuts' | 'connection_logs' | string;
type EventType = 'INSERT' | 'UPDATE' | 'DELETE';

interface UseRealtimeUpdatesProps {
  tables: TableName[];
  onDataChange: () => void;
  showToasts?: boolean;
}

export function useRealtimeUpdates({ 
  tables, 
  onDataChange,
  showToasts = true
}: UseRealtimeUpdatesProps) {
  useEffect(() => {
    console.log('Setting up realtime updates for tables:', tables);
    
    // Create a channel for each table
    const channels = tables.map(table => {
      const channel = supabase
        .channel(`${table}_changes`)
        .on('postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: table 
          },
          (payload: RealtimePostgresChangesPayload<any>) => {
            console.log(`Realtime update on ${table}:`, payload);
            
            // Show toast notification
            if (showToasts) {
              const getMessageByEvent = (event: string, tableName: string): string => {
                switch(event) {
                  case 'INSERT': 
                    return `Nouvelle entrée ajoutée dans ${tableName}`;
                  case 'UPDATE': 
                    return `Donnée mise à jour dans ${tableName}`;
                  case 'DELETE': 
                    return `Entrée supprimée dans ${tableName}`;
                  default: 
                    return `Données modifiées dans ${tableName}`;
                }
              };
              
              toast.info(getMessageByEvent(payload.eventType, table), {
                description: 'Les données ont été rafraîchies automatiquement',
                duration: 3000
              });
            }
            
            // Call the callback function to refresh data
            onDataChange();
          }
        )
        .subscribe((status) => {
          console.log(`Realtime subscription status for ${table}:`, status);
        });
        
      return channel;
    });
    
    // Cleanup subscription on unmount
    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
      console.log('Cleaned up realtime subscriptions');
    };
  }, [tables, onDataChange, showToasts]);
}
