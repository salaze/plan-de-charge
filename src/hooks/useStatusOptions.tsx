
import { useState, useEffect, useMemo } from 'react';
import { StatusCode, STATUS_LABELS, STATUS_COLORS } from '@/types';
import { useSupabaseStatuses } from './useSupabaseStatuses';
import { toast } from 'sonner';

export const useStatusOptions = () => {
  const [availableStatuses, setAvailableStatuses] = useState<{ value: StatusCode, label: string }[]>([]);
  const { statuses, loading, error } = useSupabaseStatuses();
  
  // Optimisation avec useMemo pour éviter des recalculs inutiles
  const processedStatuses = useMemo(() => {
    if (!statuses || statuses.length === 0) {
      // Utiliser des options par défaut si aucun statut n'est disponible
      return [
        { value: '' as StatusCode, label: 'Aucun' },
        { value: 'none' as StatusCode, label: 'Non défini' },
        { value: 'assistance' as StatusCode, label: 'Assistance' },
        { value: 'vigi' as StatusCode, label: 'Vigi' },
        { value: 'projet' as StatusCode, label: 'Projet' },
        { value: 'conges' as StatusCode, label: 'Congés' },
        { value: 'formation' as StatusCode, label: 'Formation' }
      ];
    }
    
    // Créer les options de statut à partir des données Supabase
    const statusOptions = statuses.map(status => ({
      value: status.code as StatusCode,
      label: status.libelle
    }));
    
    // Mettre à jour les dictionnaires STATUS_LABELS et STATUS_COLORS
    statuses.forEach(status => {
      if (status.code) {
        STATUS_LABELS[status.code as StatusCode] = status.libelle;
        if (status.couleur) {
          STATUS_COLORS[status.code as StatusCode] = status.couleur;
        }
      }
    });
    
    // Ajouter le statut "none" pour effacer la valeur
    return [
      { value: '' as StatusCode, label: 'Aucun' },
      ...statusOptions
    ];
  }, [statuses]);
  
  // Mettre à jour les options disponibles quand les statuts changent
  useEffect(() => {
    setAvailableStatuses(processedStatuses);
  }, [processedStatuses]);
  
  return {
    availableStatuses,
    loading
  };
};

export default useStatusOptions;
