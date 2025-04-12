
import { useState, useEffect } from 'react';
import { StatusCode, STATUS_LABELS } from '@/types';
import { useSupabaseStatuses } from './useSupabaseStatuses';

export const useStatusOptions = () => {
  const [availableStatuses, setAvailableStatuses] = useState<{ value: StatusCode, label: string }[]>([]);
  const { statuses, loading } = useSupabaseStatuses();
  
  useEffect(() => {
    if (!loading && statuses.length > 0) {
      // Créer les options de statut à partir des données Supabase
      const statusOptions = statuses.map(status => ({
        value: status.code as StatusCode,
        label: status.libelle
      }));
      
      // Ajouter le statut "none" pour effacer la valeur
      const allOptions = [
        { value: '' as StatusCode, label: 'Aucun' },
        ...statusOptions
      ];
      
      setAvailableStatuses(allOptions);
      
      // Mettre à jour le dictionnaire STATUS_LABELS
      statuses.forEach(status => {
        if (status.code) {
          STATUS_LABELS[status.code as StatusCode] = status.libelle;
        }
      });
      
      console.log("Options de statut chargées:", allOptions);
    } else if (!loading && statuses.length === 0) {
      // Utiliser des options par défaut si aucun statut n'est disponible
      const defaultOptions = [
        { value: '' as StatusCode, label: 'Aucun' },
        { value: 'none' as StatusCode, label: 'Non défini' },
        { value: 'assistance' as StatusCode, label: 'Assistance' },
        { value: 'vigi' as StatusCode, label: 'Vigi' },
        { value: 'projet' as StatusCode, label: 'Projet' },
        { value: 'conges' as StatusCode, label: 'Congés' },
        { value: 'formation' as StatusCode, label: 'Formation' }
      ];
      
      setAvailableStatuses(defaultOptions);
      console.log("Utilisation d'options de statut par défaut");
    }
  }, [statuses, loading]);
  
  return {
    availableStatuses,
    loading
  };
};

export default useStatusOptions;
