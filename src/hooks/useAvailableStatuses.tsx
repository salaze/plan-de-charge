
import { useState, useEffect } from 'react';
import { StatusCode } from '@/types';

export const useAvailableStatuses = (defaultStatuses: StatusCode[] = []) => {
  const [statuses, setStatuses] = useState<StatusCode[]>(defaultStatuses);
  
  useEffect(() => {
    // Récupérer les statuts disponibles depuis localStorage
    const savedData = localStorage.getItem('planningData');
    const data = savedData ? JSON.parse(savedData) : { statuses: [] };
    
    // Si nous avons des statuts personnalisés, extraire les codes
    if (data.statuses && data.statuses.length > 0) {
      setStatuses(data.statuses.map((s: any) => s.code as StatusCode));
    } else {
      // Utiliser les statuts par défaut fournis
      setStatuses(defaultStatuses);
    }
  }, [defaultStatuses]);
  
  return statuses;
};

export default useAvailableStatuses;
