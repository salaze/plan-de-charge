
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RealtimeChannel } from '@supabase/supabase-js';

export const useRealtimeSync = (isConnected: boolean, onDataChange: () => void) => {
  const [isListening, setIsListening] = useState(false);
  const reconnectTimerRef = useRef<number | null>(null);
  const channelsRef = useRef<RealtimeChannel[]>([]);

  useEffect(() => {
    // Variable pour suivre si l'on est en mode édition
    const isEditingRef = { current: false };
    // Variable pour suivre si un refresh est en attente
    const pendingRefreshRef = { current: false };

    // Écouter l'événement global qui indique que l'utilisateur a commencé à éditer
    const handleEditStart = () => {
      isEditingRef.current = true;
      console.log('Édition commencée, désactivation des actualisations automatiques');
    };

    // Écouter l'événement global qui indique que l'utilisateur a terminé d'éditer
    const handleEditEnd = () => {
      // Utiliser un délai pour éviter que des événements en file d'attente ne déclenchent un refresh immédiat
      setTimeout(() => {
        isEditingRef.current = false;
        console.log('Édition terminée, réactivation des actualisations automatiques');
        
        // Si un refresh est en attente, l'exécuter maintenant
        if (pendingRefreshRef.current) {
          console.log('Exécution du refresh en attente après la fin de l\'édition');
          pendingRefreshRef.current = false;
          setTimeout(() => {
            onDataChange();
            toast.success('Données actualisées après modification');
          }, 1000);
        }
      }, 1500);
    };

    window.addEventListener('statusEditStart', handleEditStart);
    window.addEventListener('statusEditEnd', handleEditEnd);

    // Fonction pour configurer les canaux realtime
    const setupChannels = () => {
      if (!isConnected) return;
      
      try {
        // Nettoyer les canaux existants
        cleanupChannels();
        
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
                
                onDataChange();
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
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('Souscription aux changements de statuts réussie');
              setIsListening(true);
            } else {
              console.error('Échec de souscription aux changements de statuts:', status);
              setIsListening(false);
            }
          });
        
        channelsRef.current.push(statusChannel);
          
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
              onDataChange();
            }
          )
          .subscribe();
        
        channelsRef.current.push(employeesChannel);
          
        // Ajouter un canal pour suivre les changements de planning (employe_schedule)
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
                onDataChange();
              }
            }
          )
          .subscribe();
        
        channelsRef.current.push(scheduleChannel);
      } catch (error) {
        console.error('Erreur lors de la configuration des canaux realtime:', error);
        setIsListening(false);
        
        // Tentative de reconnexion après un délai
        if (reconnectTimerRef.current === null) {
          reconnectTimerRef.current = window.setTimeout(() => {
            console.log('Tentative de reconnexion aux canaux realtime...');
            setupChannels();
            reconnectTimerRef.current = null;
          }, 5000);
        }
      }
    };
    
    // Fonction pour nettoyer les canaux
    const cleanupChannels = () => {
      channelsRef.current.forEach(channel => {
        try {
          if (channel) {
            supabase.removeChannel(channel);
          }
        } catch (error) {
          console.error('Erreur lors du nettoyage du canal:', error);
        }
      });
      channelsRef.current = [];
      setIsListening(false);
    };
    
    // Configurer les canaux si connecté
    if (isConnected) {
      setupChannels();
    } else {
      cleanupChannels();
    }
    
    return () => {
      window.removeEventListener('statusEditStart', handleEditStart);
      window.removeEventListener('statusEditEnd', handleEditEnd);
      cleanupChannels();
      
      // Nettoyer le timer de reconnexion
      if (reconnectTimerRef.current !== null) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };
  }, [isConnected, onDataChange]);

  return { isListening };
};

export default useRealtimeSync;
