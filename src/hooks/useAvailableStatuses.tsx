
import { useState, useEffect } from 'react';
import { StatusCode } from '@/types';

export const useAvailableStatuses = (defaultStatuses: StatusCode[] = []) => {
  const [statuses, setStatuses] = useState<StatusCode[]>(defaultStatuses);
  
  useEffect(() => {
    // Fonction pour récupérer les statuts depuis localStorage
    const loadStatuses = () => {
      try {
        const savedData = localStorage.getItem('planningData');
        const data = savedData ? JSON.parse(savedData) : { statuses: [] };
        
        // Si nous avons des statuts personnalisés, extraire les codes
        if (Array.isArray(data.statuses) && data.statuses.length > 0) {
          const validStatuses = data.statuses
            .filter((s: any) => s && s.code) // Make sure each status has a code
            .map((s: any) => s.code as StatusCode);
            
          setStatuses(validStatuses.length > 0 ? validStatuses : defaultStatuses);
        } else {
          // Utiliser les statuts par défaut fournis
          setStatuses(defaultStatuses);
        }
      } catch (error) {
        console.error('Error loading statuses:', error);
        setStatuses(defaultStatuses); // Fallback to defaults on error
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
    
    // Écouter l'événement personnalisé pour les mises à jour de statuts
    const handleCustomEvent = () => loadStatuses();
    
    // Ajouter les écouteurs d'événements
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('statusesUpdated', handleCustomEvent);
    
    // Nettoyer les écouteurs lors du démontage
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('statusesUpdated', handleCustomEvent);
    };
  }, [defaultStatuses]);
  
  return statuses;
};

export default useAvailableStatuses;
