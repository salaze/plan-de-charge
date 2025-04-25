
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StatusCode } from '@/types';
import { toast } from 'sonner';

interface UseStatusLoaderResult {
  availableStatuses: StatusCode[];
  isLoading: boolean;
}

export function useStatusLoader(): UseStatusLoaderResult {
  const [availableStatuses, setAvailableStatuses] = useState<StatusCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const retryCountRef = useRef(0);
  const loadingTimeoutRef = useRef<number | null>(null);
  const isMounted = useRef(true);

  const loadStatusesFromSupabase = async () => {
    if (!isMounted.current) return;
    
    setIsLoading(true);
    
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    
    loadingTimeoutRef.current = window.setTimeout(() => {
      if (!isMounted.current) return;
      
      console.log("Timeout lors du chargement des statuts");
      setIsLoading(false);
      const defaultStatuses: StatusCode[] = [
        'none', 'assistance', 'vigi', 'formation', 'projet', 
        'conges', 'management', 'tp', 'coordinateur', 'absence',
        'regisseur', 'demenagement', 'permanence', 'parc'
      ];
      setAvailableStatuses(defaultStatuses);
    }, 3000);
    
    try {
      console.log("Chargement des options de statut depuis Supabase...");
      
      const { data: statusData, error } = await supabase
        .from('statuts')
        .select('code, libelle, couleur')
        .order('display_order', { ascending: true });
      
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      
      if (error) {
        console.error("Erreur lors du chargement des options de statut:", error);
        throw error;
      }
      
      if (!isMounted.current) return;
      
      console.log("Options de statut récupérées:", statusData);
      retryCountRef.current = 0;
      
      if (Array.isArray(statusData) && statusData.length > 0) {
        const supabaseStatuses = statusData
          .filter((status) => status && status.code && status.code.trim() !== '')
          .map((status) => status.code as StatusCode);
        
        console.log("Options de statut valides:", supabaseStatuses);
        setAvailableStatuses([...supabaseStatuses]);
      }
    } catch (error) {
      console.error('Error loading status options from Supabase:', error);
      
      if (!isMounted.current) return;
      
      if (retryCountRef.current < 3) {
        retryCountRef.current++;
        console.log(`Tentative ${retryCountRef.current}/3 de rechargement des statuts`);
        setTimeout(loadStatusesFromSupabase, 1000);
        return;
      }
      
      const defaultStatuses: StatusCode[] = [
        'none', 'assistance', 'vigi', 'formation', 'projet', 
        'conges', 'management', 'tp', 'coordinateur', 'absence',
        'regisseur', 'demenagement', 'permanence', 'parc'
      ];
      setAvailableStatuses(defaultStatuses);
    } finally {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  // Ajout de l'effet pour charger les données au montage du composant
  useEffect(() => {
    // Initialisation du chargement des statuts
    loadStatusesFromSupabase();
    
    // Nettoyage lors du démontage
    return () => {
      isMounted.current = false;
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, []);

  return { availableStatuses, isLoading };
}
