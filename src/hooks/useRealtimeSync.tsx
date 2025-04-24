
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useRealtimeSync = (isConnected: boolean, onDataChange: () => void) => {
  useEffect(() => {
    if (!isConnected) return;

    // Variable pour suivre si l'on est en mode édition
    const isEditingRef = { current: false };

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
      }, 1000);
    };

    window.addEventListener('statusEditStart', handleEditStart);
    window.addEventListener('statusEditEnd', handleEditEnd);

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
      .subscribe();
      
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
            return;
          }
          
          console.log('Changement d\'employé détecté:', payload);
          toast.info('Données d\'employé mises à jour sur le serveur, actualisation...');
          onDataChange();
        }
      )
      .subscribe();
      
    return () => {
      window.removeEventListener('statusEditStart', handleEditStart);
      window.removeEventListener('statusEditEnd', handleEditEnd);
      supabase.removeChannel(statusChannel);
      supabase.removeChannel(employeesChannel);
    };
  }, [isConnected, onDataChange]);
};
