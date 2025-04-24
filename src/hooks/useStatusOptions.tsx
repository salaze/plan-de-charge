
import { useState, useEffect } from 'react';
import { StatusCode, STATUS_LABELS } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StatusOption {
  value: StatusCode;
  label: string;
}

export function useStatusOptions() {
  const [availableStatuses, setAvailableStatuses] = useState<StatusOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Fonction pour charger les statuts depuis Supabase
    const loadStatusesFromSupabase = async () => {
      setIsLoading(true);
      try {
        console.log("Chargement des options de statut depuis Supabase...");
        // Timeout plus court pour échouer plus rapidement en cas d'absence de connexion
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 secondes de timeout
        
        const { data: statusData, error } = await supabase
          .from('statuts')
          .select('code, libelle, couleur')
          .order('display_order', { ascending: true })
          .abortSignal(controller.signal);
          
        clearTimeout(timeoutId);
        
        if (error) {
          console.error("Erreur lors du chargement des options de statut:", error);
          throw error;
        }
        
        console.log("Options de statut récupérées:", statusData);
        
        if (Array.isArray(statusData) && statusData.length > 0) {
          // Mise à jour dynamique des STATUS_LABELS et STATUS_COLORS
          statusData.forEach(status => {
            if (status.code && STATUS_LABELS) {
              STATUS_LABELS[status.code as StatusCode] = status.libelle || status.code;
            }
          });
          
          const supabaseStatuses = statusData
            .filter((status) => status && status.code && status.code.trim() !== '') // Filtrer les codes vides
            .map((status) => ({
              value: status.code as StatusCode,
              label: status.libelle || status.code || 'Status'
            }));
          
          console.log("Options de statut valides:", supabaseStatuses);
          setAvailableStatuses([
            { value: 'none', label: 'Aucun' },
            ...supabaseStatuses
          ]);
          
          // Déclencher un événement pour informer l'application que les statuts ont été mis à jour
          const event = new CustomEvent('statusesUpdated');
          window.dispatchEvent(event);
        } else {
          toast.error("Aucun statut trouvé dans la base de données");
          setAvailableStatuses([
            { value: 'none', label: 'Aucun' }
          ]);
        }
      } catch (error) {
        console.error('Error loading status options from Supabase:', error);
        toast.error("Erreur lors du chargement des options de statut");
        setAvailableStatuses([
          { value: 'none', label: 'Aucun' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Charger les statuts immédiatement
    loadStatusesFromSupabase();
    
    // S'abonner aux changements en temps réel des statuts
    const channel = supabase
      .channel('status-options-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'statuts'
        },
        (payload) => {
          console.log('Changement de statut détecté, actualisation des options:', payload);
          toast.info('Nouvelles options de statut disponibles, actualisation en cours...');
          loadStatusesFromSupabase();
        }
      )
      .subscribe();
    
    // Écouter également les événements de window pour la cohérence des statuts
    const handleStatusesUpdated = () => {
      console.log("Événement statusesUpdated reçu, actualisation des statuts...");
      loadStatusesFromSupabase();
    };
    
    window.addEventListener('statusesUpdated', handleStatusesUpdated);
    
    return () => {
      window.removeEventListener('statusesUpdated', handleStatusesUpdated);
      supabase.removeChannel(channel);
    };
  }, []);
  
  return { availableStatuses, isLoading };
}

export default useStatusOptions;
