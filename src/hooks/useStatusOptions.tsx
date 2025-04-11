
import { useState, useEffect } from 'react';
import { StatusCode } from '@/types';
import { useSupabaseStatuses } from './useSupabaseStatuses';

interface StatusOption {
  value: StatusCode;
  label: string;
}

export function useStatusOptions(defaultStatuses: StatusCode[] = []) {
  const [availableStatuses, setAvailableStatuses] = useState<StatusOption[]>([]);
  const { statuses: supabaseStatuses, loading } = useSupabaseStatuses();
  
  useEffect(() => {
    // Si nous avons des statuts depuis Supabase, les utiliser
    if (supabaseStatuses && supabaseStatuses.length > 0) {
      const customStatuses = supabaseStatuses
        .filter((status) => status.code && status.code.trim() !== '')
        .map((status) => ({
          value: status.code,
          label: status.libelle || status.code || 'Status'
        }));
      
      setAvailableStatuses([
        { value: 'none', label: 'Aucun' },
        ...customStatuses
      ]);
    } else {
      // Fallback au localStorage si nécessaire
      const savedData = localStorage.getItem('planningData');
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          if (data.statuses && data.statuses.length > 0) {
            const localStatuses = data.statuses
              .filter((status: any) => status.code && status.code.trim() !== '')
              .map((status: any) => ({
                value: status.code as StatusCode,
                label: status.label || status.code || 'Status'
              }));
            
            setAvailableStatuses([
              { value: 'none', label: 'Aucun' },
              ...localStatuses
            ]);
          } else {
            // Utiliser les statuts par défaut si pas de données locales
            setDefaultStatuses();
          }
        } catch (error) {
          console.error("Erreur lors du parsing des données locales:", error);
          setDefaultStatuses();
        }
      } else {
        setDefaultStatuses();
      }
    }
  }, [supabaseStatuses, defaultStatuses]);
  
  const setDefaultStatuses = () => {
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
  };
  
  useEffect(() => {
    // Écouter l'événement personnalisé pour forcer le rechargement des statuts
    const handleCustomEvent = () => console.log("Événement de mise à jour détecté dans useStatusOptions");
    
    window.addEventListener('statusesUpdated', handleCustomEvent);
    
    return () => {
      window.removeEventListener('statusesUpdated', handleCustomEvent);
    };
  }, []);
  
  return { availableStatuses, loading };
}

export default useStatusOptions;
