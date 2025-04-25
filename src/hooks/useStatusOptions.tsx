
import { useState, useEffect, useRef } from 'react';
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
  const loadingTimeoutRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);
  const isMounted = useRef(true);
  
  useEffect(() => {
    // Fonction pour charger les statuts depuis Supabase
    const loadStatusesFromSupabase = async () => {
      if (!isMounted.current) return;
      
      setIsLoading(true);
      
      // Définir un timeout pour éviter les attentes trop longues
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      loadingTimeoutRef.current = window.setTimeout(() => {
        if (!isMounted.current) return;
        
        console.log("Timeout lors du chargement des statuts");
        setIsLoading(false);
        // Utiliser les statuts par défaut en cas de timeout
        const defaultStatuses: StatusOption[] = [
          { value: 'none', label: 'Aucun' },
          { value: 'assistance', label: 'Assistance' },
          { value: 'vigi', label: 'Vigi' },
          { value: 'formation', label: 'Formation' },
          { value: 'projet', label: 'Projet' },
          { value: 'conges', label: 'Congés' },
          { value: 'parc', label: 'Gestion de Parc' }
        ];
        setAvailableStatuses(defaultStatuses);
      }, 5000) as unknown as number;
      
      try {
        console.log("Chargement des options de statut depuis Supabase...");
        
        const { data: statusData, error } = await supabase
          .from('statuts')
          .select('code, libelle, couleur')
          .order('display_order', { ascending: true });
        
        // Nettoyer le timeout car nous avons une réponse
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
          loadingTimeoutRef.current = null;
        }
        
        if (error) {
          console.error("Erreur lors du chargement des options de statut:", error);
          throw error;
        }
        
        if (!isMounted.current) return;
        
        console.log("Options de statut récupérées:", statusData);
        retryCountRef.current = 0; // Réinitialiser le compteur de tentatives
        
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
          
          // Vérifier si le statut "parc" est présent
          const isParcStatusPresent = supabaseStatuses.some(s => s.value === 'parc');
          
          // S'assurer que "none" est toujours présent au début
          setAvailableStatuses([
            { value: 'none', label: 'Aucun' },
            ...supabaseStatuses
          ]);
          
          if (!isParcStatusPresent) {
            console.log("Statut 'parc' manquant, il sera automatiquement ajouté au prochain démarrage");
          }
        } else {
          console.warn("Aucun statut trouvé dans la base de données");
          
          // Utiliser les statuts par défaut
          if (isMounted.current) {
            const defaultStatuses: StatusOption[] = [
              { value: 'none', label: 'Aucun' },
              { value: 'assistance', label: 'Assistance' },
              { value: 'vigi', label: 'Vigi' },
              { value: 'formation', label: 'Formation' },
              { value: 'projet', label: 'Projet' },
              { value: 'conges', label: 'Congés' },
              { value: 'parc', label: 'Gestion de Parc' }
            ];
            setAvailableStatuses(defaultStatuses);
          }
        }
      } catch (error) {
        console.error('Error loading status options from Supabase:', error);
        
        if (!isMounted.current) return;
        
        // Réessayer jusqu'à 3 fois en cas d'erreur
        if (retryCountRef.current < 3) {
          retryCountRef.current++;
          console.log(`Tentative ${retryCountRef.current}/3 de rechargement des statuts`);
          setTimeout(loadStatusesFromSupabase, 2000);
          return;
        }
        
        // Utiliser les statuts par défaut en cas d'échec
        const defaultStatuses: StatusOption[] = [
          { value: 'none', label: 'Aucun' },
          { value: 'assistance', label: 'Assistance' },
          { value: 'vigi', label: 'Vigi' },
          { value: 'formation', label: 'Formation' },
          { value: 'projet', label: 'Projet' },
          { value: 'conges', label: 'Congés' },
          { value: 'parc', label: 'Gestion de Parc' }
        ];
        setAvailableStatuses(defaultStatuses);
      } finally {
        // Nettoyer le timeout
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
          loadingTimeoutRef.current = null;
        }
        if (isMounted.current) {
          setIsLoading(false);
        }
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
          if (!isMounted.current) return;
          
          console.log('Changement de statut détecté, actualisation des options:', payload);
          
          // Recharger après un court délai pour éviter les problèmes avec les événements d'édition
          setTimeout(() => {
            if (isMounted.current) {
              loadStatusesFromSupabase();
            }
          }, 2000);
        }
      )
      .subscribe();
    
    // Écouter les événements spécifiques qui déclenchent une actualisation des statuts
    const handleStatusesUpdated = (event: Event) => {
      if (!isMounted.current) return;
      
      const customEvent = event as CustomEvent;
      const noRefresh = customEvent.detail?.noRefresh === true;
      
      // Ne pas recharger si l'événement demande de ne pas actualiser
      if (!noRefresh) {
        console.log("Rechargement des options de statut suite à un événement");
        loadStatusesFromSupabase();
      }
    };
    
    window.addEventListener('statusesUpdated', handleStatusesUpdated);
    
    return () => {
      isMounted.current = false;
      window.removeEventListener('statusesUpdated', handleStatusesUpdated);
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, []);
  
  return { availableStatuses, isLoading };
}

export default useStatusOptions;
