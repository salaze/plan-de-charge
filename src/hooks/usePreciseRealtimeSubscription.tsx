
import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { toast } from 'sonner';

type TableName = 'employe_schedule' | 'statuts' | 'employes';
type EventType = 'INSERT' | 'UPDATE' | 'DELETE' | '*';
type HandlerFunction = (payload: any) => void;

interface PreciseSubscriptionOptions {
  showNotifications?: boolean;
  bufferTime?: number; // Temps en ms pour regrouper les mises à jour
  precision?: 'high' | 'normal' | 'low'; // Niveau de précision
  onEventReceived?: HandlerFunction; // Callback personnalisé pour les événements
}

/**
 * Hook pour des abonnements temps réel de haute précision
 */
export const usePreciseRealtimeSubscription = (
  tableName: TableName,
  eventType: EventType = '*',
  options: PreciseSubscriptionOptions = {}
) => {
  const {
    showNotifications = true,
    bufferTime = 50, // 50ms par défaut pour grouper les événements
    precision = 'high',
    onEventReceived
  } = options;
  
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updateCount, setUpdateCount] = useState(0);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const pendingEvents = useRef<any[]>([]);
  
  // Définir la priorité des événements basée sur la précision
  const precisionSettings = {
    high: { 
      bufferTime: bufferTime, 
      notifyEvery: 1, // Notifier à chaque événement
      backgroundSync: false // Pas de synchronisation en arrière-plan
    },
    normal: { 
      bufferTime: Math.max(bufferTime, 200), 
      notifyEvery: 3, // Notifier tous les 3 événements
      backgroundSync: false 
    },
    low: { 
      bufferTime: Math.max(bufferTime, 500), 
      notifyEvery: 5, // Notifier tous les 5 événements
      backgroundSync: true // Utiliser la synchronisation en arrière-plan
    }
  };
  
  const settings = precisionSettings[precision];
  
  // Fonction pour traiter les événements en attente
  const processPendingEvents = useCallback(() => {
    if (pendingEvents.current.length === 0) return;
    
    const events = [...pendingEvents.current];
    pendingEvents.current = [];
    
    // Mettre à jour les stats
    setUpdateCount(prev => prev + events.length);
    setLastUpdate(new Date());
    
    // Traiter les événements
    events.forEach(event => {
      if (onEventReceived) {
        onEventReceived(event);
      }
    });
    
    // Afficher une notification groupée si nécessaire
    if (showNotifications && events.length > 0 && events.length % settings.notifyEvery === 0) {
      if (events.length === 1) {
        const eventType = events[0].eventType;
        const messages = {
          INSERT: 'Nouvelle entrée ajoutée',
          UPDATE: 'Données mises à jour',
          DELETE: 'Entrée supprimée'
        };
        toast.info(`${messages[eventType as keyof typeof messages]} dans ${tableName}`);
      } else {
        toast.info(`${events.length} mises à jour détectées pour ${tableName}`);
      }
    }
    
    timeoutRef.current = null;
  }, [tableName, showNotifications, settings.notifyEvery, onEventReceived]);
  
  // Établir la connexion et configurer l'abonnement
  useEffect(() => {
    // Créer un identifiant de canal unique
    const channelId = `precise_${tableName}_${Date.now().toString(36)}`;
    console.log(`⚡ Setting up precise realtime subscription for ${tableName}, precision: ${precision}`);
    
    // Créer le canal Supabase
    const channel = supabase.channel(channelId);
    channelRef.current = channel;
    
    // Configurer l'écoute avec une gestion d'événements optimisée
    channel
      .on(
        'postgres_changes',
        {
          event: eventType,
          schema: 'public',
          table: tableName
        },
        (payload) => {
          console.log(`⚡ Realtime event on ${tableName}:`, payload);
          
          // Ajouter l'événement à la file d'attente
          pendingEvents.current.push(payload);
          
          // Utiliser requestAnimationFrame pour une meilleure synchronisation avec le navigateur
          if (settings.backgroundSync) {
            // Mode basse priorité : utiliser setTimeout
            if (timeoutRef.current === null) {
              timeoutRef.current = window.setTimeout(processPendingEvents, settings.bufferTime);
            }
          } else {
            // Mode haute priorité : utiliser requestAnimationFrame pour la synchronisation visuelle
            if (timeoutRef.current === null) {
              if (timeoutRef.current !== null) {
                cancelAnimationFrame(timeoutRef.current as number);
              }
              timeoutRef.current = requestAnimationFrame(() => {
                setTimeout(processPendingEvents, settings.bufferTime);
              });
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Precise subscription active for ${tableName}`);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error(`❌ Error with precise subscription for ${tableName}: ${status}`);
          // Tentative de reconnexion automatique après un délai
          setTimeout(() => {
            if (channelRef.current === channel) {
              console.log(`🔄 Attempting to reconnect subscription for ${tableName}...`);
              channel.subscribe();
            }
          }, 5000);
        }
      });
    
    // Nettoyage lors du démontage
    return () => {
      console.log(`🧹 Cleaning up precise subscription for ${tableName}`);
      if (timeoutRef.current !== null) {
        if (settings.backgroundSync) {
          clearTimeout(timeoutRef.current);
        } else {
          cancelAnimationFrame(timeoutRef.current);
        }
        timeoutRef.current = null;
      }
      
      // Nettoyage du canal
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        } catch (error) {
          console.error(`Error removing channel for ${tableName}:`, error);
        }
      }
    };
  }, [tableName, eventType, precision, settings, processPendingEvents]);
  
  return {
    lastUpdate,
    updateCount,
    isActive: !!channelRef.current
  };
};
