
import { useState, useEffect } from 'react';
import { StatusCode } from '@/types';

interface StatusOption {
  value: StatusCode;
  label: string;
}

export function useStatusOptions(defaultStatuses: StatusCode[] = []) {
  const [availableStatuses, setAvailableStatuses] = useState<StatusOption[]>([]);
  
  useEffect(() => {
    const loadStatuses = () => {
      try {
        const savedData = localStorage.getItem('planningData');
        const data = savedData ? JSON.parse(savedData) : { statuses: [] };
        
        // Si nous avons des statuts personnalisés, les utiliser
        if (Array.isArray(data.statuses) && data.statuses.length > 0) {
          const customStatuses = data.statuses
            .filter((status: any) => status && status.code && status.code.trim() !== '') // Filter out any empty codes
            .map((status: any) => ({
              value: status.code as StatusCode,
              label: status.label || status.code || 'Status'
            }));
          
          setAvailableStatuses([
            { value: 'none', label: 'Aucun' },
            ...customStatuses
          ]);
        } else {
          // Sinon, utiliser les statuts par défaut fournis
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
        console.error('Error loading status options:', error);
        // Use default options on error
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
    loadStatuses();
    
    // Écouter les changements dans le localStorage
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'planningData') {
        loadStatuses();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Créer un événement personnalisé pour forcer le rechargement des statuts
    const handleCustomEvent = () => loadStatuses();
    window.addEventListener('statusesUpdated', handleCustomEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('statusesUpdated', handleCustomEvent);
    };
  }, [defaultStatuses]);
  
  return availableStatuses;
}

export default useStatusOptions;
