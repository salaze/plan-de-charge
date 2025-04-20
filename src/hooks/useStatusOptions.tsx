
import { useState, useEffect } from 'react';
import { StatusCode } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface StatusOption {
  value: StatusCode;
  label: string;
}

export function useStatusOptions(defaultStatuses: StatusCode[] = []) {
  const [availableStatuses, setAvailableStatuses] = useState<StatusOption[]>([]);
  
  useEffect(() => {
    // Fonction pour charger les statuts depuis Supabase
    const loadStatusesFromSupabase = async () => {
      try {
        const { data: statusData, error } = await supabase
          .from('statuts')
          .select('code, libelle')
          .order('display_order', { ascending: true });
          
        if (error) throw error;
        
        if (Array.isArray(statusData) && statusData.length > 0) {
          const supabaseStatuses = statusData
            .filter((status) => status && status.code && status.code.trim() !== '') // Filtrer les codes vides
            .map((status) => ({
              value: status.code as StatusCode,
              label: status.libelle || status.code || 'Status'
            }));
          
          setAvailableStatuses([
            { value: 'none', label: 'Aucun' },
            ...supabaseStatuses
          ]);
          return; // Sortir de la fonction si les statuts de Supabase sont chargés avec succès
        }
        
        // Si nous n'avons pas pu charger depuis Supabase, essayer le localStorage
        loadStatusesFromLocalStorage();
      } catch (error) {
        console.error('Error loading status options from Supabase:', error);
        // En cas d'erreur, charger depuis localStorage
        loadStatusesFromLocalStorage();
      }
    };
    
    // Fonction de secours pour charger les statuts depuis localStorage
    const loadStatusesFromLocalStorage = () => {
      try {
        const savedData = localStorage.getItem('planningData');
        const data = savedData ? JSON.parse(savedData) : { statuses: [] };
        
        // Si nous avons des statuts personnalisés, les utiliser
        if (Array.isArray(data.statuses) && data.statuses.length > 0) {
          const customStatuses = data.statuses
            .filter((status: any) => status && status.code && status.code.trim() !== '') // Filtrer les codes vides
            .map((status: any) => ({
              value: status.code as StatusCode,
              label: status.label || status.code || 'Status'
            }));
          
          setAvailableStatuses([
            { value: 'none', label: 'Aucun' },
            ...customStatuses
          ]);
        } else {
          // Sinon, utiliser les statuts par défaut
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
        (_payload) => {
          console.log('Status change detected, refreshing options');
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
  
  return availableStatuses;
}

export default useStatusOptions;
