
import { useState, useEffect } from 'react';
import { StatusCode } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StatusOption {
  value: StatusCode;
  label: string;
}

export function useStatusOptions(defaultStatuses: StatusCode[] = []) {
  const [availableStatuses, setAvailableStatuses] = useState<StatusOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Fonction pour charger les statuts depuis Supabase
    const loadStatusesFromSupabase = async () => {
      setIsLoading(true);
      try {
        console.log("Chargement des options de statut depuis Supabase...");
        // Utiliser un mécanisme de timeout pour éviter des attentes trop longues
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 secondes de timeout
        
        const { data: statusData, error } = await supabase
          .from('statuts')
          .select('code, libelle')
          .order('display_order', { ascending: true })
          .abortSignal(controller.signal);
          
        clearTimeout(timeoutId);
        
        if (error) {
          console.error("Erreur lors du chargement des options de statut:", error);
          throw error;
        }
        
        console.log("Options de statut récupérées:", statusData);
        
        if (Array.isArray(statusData) && statusData.length > 0) {
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
        } else {
          // Si nous n'avons pas pu charger depuis Supabase, essayer le localStorage
          console.log("Aucune option de statut trouvée dans Supabase, chargement depuis localStorage");
          loadStatusesFromLocalStorage();
        }
      } catch (error) {
        console.error('Error loading status options from Supabase:', error);
        // En cas d'erreur, charger depuis localStorage
        loadStatusesFromLocalStorage();
      } finally {
        setIsLoading(false);
      }
    };
    
    // Fonction de secours pour charger les statuts depuis localStorage
    const loadStatusesFromLocalStorage = () => {
      try {
        const savedData = localStorage.getItem('planningData');
        const data = savedData ? JSON.parse(savedData) : { statuses: [] };
        
        console.log("Données du localStorage pour les options:", data);
        
        // Si nous avons des statuts personnalisés, les utiliser
        if (Array.isArray(data.statuses) && data.statuses.length > 0) {
          const customStatuses = data.statuses
            .filter((status: any) => status && status.code && status.code.trim() !== '') // Filtrer les codes vides
            .map((status: any) => ({
              value: status.code as StatusCode,
              label: status.label || status.code || 'Status'
            }));
          
          console.log("Options de statut personnalisées:", customStatuses);
          setAvailableStatuses([
            { value: 'none', label: 'Aucun' },
            ...customStatuses
          ]);
        } else {
          // Sinon, utiliser les statuts par défaut
          console.log("Utilisation des options de statut par défaut");
          setAvailableStatuses([
            { value: 'none', label: 'Aucun' },
            { value: 'assistance', label: 'Assistance' },
            { value: 'vigi', label: 'Vigi' },
            { value: 'formation', label: 'Formation' },
            { value: 'projet', label: 'Projet' },
            { value: 'conges', label: 'Congés' },
            { value: 'management', label: 'Management' },
            { value: 'tp', label: 'Temps Partiel' },
            { value: 'coordinateur', label: 'Coordinateur Vigi Ticket' },
            { value: 'absence', label: 'Autre Absence' },
            { value: 'regisseur', label: 'Régisseur' },
            { value: 'demenagement', label: 'Déménagements' },
          ]);
        }
      } catch (error) {
        console.error('Error loading status options from localStorage:', error);
        // Utiliser les statuts par défaut
        setAvailableStatuses([
          { value: 'none', label: 'Aucun' },
          { value: 'assistance', label: 'Assistance' },
          { value: 'vigi', label: 'Vigi' },
          { value: 'formation', label: 'Formation' },
          { value: 'projet', label: 'Projet' },
          { value: 'conges', label: 'Congés' },
        ]);
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
          console.log('Status change detected, refreshing options', payload);
          loadStatusesFromSupabase();
        }
      )
      .subscribe();
    
    // Écouter les changements dans le localStorage
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'planningData') {
        loadStatusesFromLocalStorage();
      }
    };
    
    // Écouter l'événement personnalisé pour forcer le rechargement des statuts
    const handleCustomEvent = () => loadStatusesFromSupabase();
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('statusesUpdated', handleCustomEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('statusesUpdated', handleCustomEvent);
      supabase.removeChannel(channel);
    };
  }, [defaultStatuses]);
  
  return { availableStatuses, isLoading };
}

export default useStatusOptions;
