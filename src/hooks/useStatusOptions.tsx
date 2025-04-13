
import { useState, useEffect, useMemo, useRef } from 'react';
import { StatusCode, STATUS_LABELS, STATUS_COLORS } from '@/types';
import { useSupabaseStatuses } from './useSupabaseStatuses';
import { toast } from 'sonner';

export const useStatusOptions = () => {
  const [availableStatuses, setAvailableStatuses] = useState<{ value: StatusCode, label: string }[]>([]);
  const { statuses, loading, error, fetchStatuses } = useSupabaseStatuses();
  const retryCount = useRef(0);
  const cacheExpiry = useRef<number>(0);
  const isMounted = useRef(true);
  const MAX_RETRIES = 2;
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  // Default status options for fallback
  const defaultStatuses = useMemo(() => [
    { value: '' as StatusCode, label: 'Aucun' },
    { value: 'none' as StatusCode, label: 'Non défini' },
    { value: 'assistance' as StatusCode, label: 'Assistance' },
    { value: 'vigi' as StatusCode, label: 'Vigi' },
    { value: 'projet' as StatusCode, label: 'Projet' },
    { value: 'conges' as StatusCode, label: 'Congés' },
    { value: 'formation' as StatusCode, label: 'Formation' }
  ], []);
  
  // Optimisation avec useMemo pour éviter des recalculs inutiles
  const processedStatuses = useMemo(() => {
    if (!statuses || statuses.length === 0) {
      // Utiliser des options par défaut si aucun statut n'est disponible
      return defaultStatuses;
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
  }, [statuses, defaultStatuses]);
  
  // Vérifier si le cache est encore valide
  const isCacheValid = useCallback(() => {
    return Date.now() < cacheExpiry.current;
  }, []);
  
  // Initialisation - vérifier le cache local d'abord
  useEffect(() => {
    // Si le statut est already loaded
    if (availableStatuses.length > 1 && availableStatuses[0].value === '') {
      console.log("Statuts déjà chargés en mémoire");
      return;
    }
    
    try {
      // Essayer de charger du localStorage
      const cachedStatusesJson = localStorage.getItem('cachedStatuses');
      const cachedExpiryTime = localStorage.getItem('cachedStatusesExpiry');
      
      if (cachedStatusesJson && cachedExpiryTime) {
        const cachedStatuses = JSON.parse(cachedStatusesJson);
        const expiryTime = parseInt(cachedExpiryTime);
        
        if (Date.now() < expiryTime && cachedStatuses.length > 0) {
          console.log("Utilisation du cache local des statuts");
          setAvailableStatuses(cachedStatuses);
          cacheExpiry.current = expiryTime;
          return;
        }
      }
    } catch (e) {
      console.warn("Erreur lors de la lecture du cache:", e);
    }
  }, [availableStatuses]);
  
  // Mettre à jour les options disponibles quand les statuts changent
  useEffect(() => {
    if (processedStatuses.length > 1) {
      setAvailableStatuses(processedStatuses);
      
      // Sauvegarder dans le cache local
      try {
        localStorage.setItem('cachedStatuses', JSON.stringify(processedStatuses));
        const newExpiryTime = Date.now() + CACHE_DURATION;
        localStorage.setItem('cachedStatusesExpiry', newExpiryTime.toString());
        cacheExpiry.current = newExpiryTime;
        console.log("Statuts mis en cache jusqu'à", new Date(newExpiryTime).toLocaleTimeString());
      } catch (e) {
        console.warn("Erreur lors de la mise en cache des statuts:", e);
      }
      
      // Reset retry count when statuses load successfully
      retryCount.current = 0;
    }
  }, [processedStatuses, CACHE_DURATION]);
  
  // Cleanup effect
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Automatiquement réessayer de charger les statuts en cas d'erreur
  useEffect(() => {
    if (error && retryCount.current < MAX_RETRIES && isMounted.current) {
      const retryDelay = Math.pow(2, retryCount.current) * 1000; // Exponential backoff
      
      console.log(`Nouvelle tentative de chargement des statuts dans ${retryDelay}ms (${retryCount.current + 1}/${MAX_RETRIES})`);
      
      const timer = setTimeout(() => {
        if (isMounted.current) {
          retryCount.current += 1;
          fetchStatuses(true); // Force refresh on retry
        }
      }, retryDelay);
      
      return () => clearTimeout(timer);
    }
  }, [error, fetchStatuses, MAX_RETRIES]);
  
  return {
    availableStatuses,
    loading: loading && availableStatuses.length <= 1,
    error: error && retryCount.current >= MAX_RETRIES
  };
};

export default useStatusOptions;
