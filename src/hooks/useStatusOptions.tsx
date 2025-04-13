
import { useState, useEffect, useMemo, useRef } from 'react';
import { StatusCode, STATUS_LABELS, STATUS_COLORS } from '@/types';
import { useSupabaseStatuses } from './useSupabaseStatuses';
import { toast } from 'sonner';

export const useStatusOptions = () => {
  const [availableStatuses, setAvailableStatuses] = useState<{ value: StatusCode, label: string }[]>([]);
  const { statuses, loading, error, fetchStatuses } = useSupabaseStatuses();
  const retryCount = useRef(0);
  const cacheExpiry = useRef<number>(0);
  const MAX_RETRIES = 2;
  
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
    // Reset retry count when statuses load successfully
    if (statuses && statuses.length > 0) {
      retryCount.current = 0;
      cacheExpiry.current = Date.now() + 5 * 60 * 1000; // 5 minutes cache
    }
  }, [processedStatuses]);
  
  // Automatiquement réessayer de charger les statuts en cas d'erreur
  useEffect(() => {
    if (error && retryCount.current < MAX_RETRIES) {
      const retryDelay = Math.pow(2, retryCount.current) * 1000; // Exponential backoff
      
      console.log(`Nouvelle tentative de chargement des statuts dans ${retryDelay}ms (${retryCount.current + 1}/${MAX_RETRIES})`);
      
      const timer = setTimeout(() => {
        retryCount.current += 1;
        fetchStatuses(true); // Force refresh on retry
      }, retryDelay);
      
      return () => clearTimeout(timer);
    }
  }, [error, fetchStatuses]);
  
  return {
    availableStatuses,
    loading,
    error
  };
};

export default useStatusOptions;
