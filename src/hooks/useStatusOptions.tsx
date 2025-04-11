
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
      const savedData = localStorage.getItem('planningData');
      const data = savedData ? JSON.parse(savedData) : { statuses: [] };
      
      // Si nous avons des statuts personnalisés, les utiliser
      if (data.statuses && data.statuses.length > 0) {
        const customStatuses = data.statuses
          .filter((status: any) => status.code && status.code.trim() !== '') // Filter out any empty codes
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
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [defaultStatuses]);
  
  return availableStatuses;
}

export default useStatusOptions;
