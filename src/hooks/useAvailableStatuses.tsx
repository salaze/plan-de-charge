
import { useState, useEffect } from 'react';
import { StatusCode } from '@/types';

export const useAvailableStatuses = (defaultStatuses: StatusCode[] = []) => {
  const [statuses, setStatuses] = useState<StatusCode[]>(defaultStatuses);
  
  useEffect(() => {
    // Fonction pour récupérer les statuts depuis localStorage
    const loadStatuses = () => {
      const savedData = localStorage.getItem('planningData');
      const data = savedData ? JSON.parse(savedData) : { statuses: [] };
      
      // Si nous avons des statuts personnalisés, extraire les codes
      if (data.statuses && data.statuses.length > 0) {
        setStatuses(data.statuses.map((s: any) => s.code as StatusCode));
      } else {
        // Utiliser les statuts par défaut fournis
        setStatuses(defaultStatuses);
      }
    };
    
    // Charger les statuts au montage du composant
    loadStatuses();
    
    // Écouter les changements dans le localStorage
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'planningData') {
        loadStatuses();
      }
    };
    
    // Ajouter l'écouteur d'événement pour le localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Nettoyer l'écouteur lors du démontage
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [defaultStatuses]);
  
  return statuses;
};

export default useAvailableStatuses;
