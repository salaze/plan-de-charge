
import { useState, useEffect } from 'react';
import { StatusCode, STATUS_LABELS, STATUS_COLORS } from '@/types';
import { useSupabaseStatuses } from './useSupabaseStatuses';
import { toast } from 'sonner';

export const useStatusOptions = () => {
  const [availableStatuses, setAvailableStatuses] = useState<{ value: StatusCode, label: string }[]>([]);
  const { statuses, loading, error } = useSupabaseStatuses();
  
  useEffect(() => {
    if (!loading) {
      if (error) {
        console.error("Erreur lors du chargement des statuts:", error);
        toast.error("Impossible de charger les statuts depuis Supabase");
      }
      
      if (statuses && statuses.length > 0) {
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
        
        // Mettre à jour les dictionnaires STATUS_LABELS et STATUS_COLORS
        statuses.forEach(status => {
          if (status.code) {
            STATUS_LABELS[status.code as StatusCode] = status.libelle;
            if (status.couleur) {
              STATUS_COLORS[status.code as StatusCode] = status.couleur;
            }
          }
        });
        
        console.log("Options de statut chargées:", allOptions);
      } else {
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
    }
  }, [statuses, loading, error]);
  
  return {
    availableStatuses,
    loading
  };
};

export default useStatusOptions;
