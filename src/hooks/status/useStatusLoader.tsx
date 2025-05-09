
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StatusCode, STATUS_LABELS, STATUS_COLORS } from '@/types';
import { toast } from 'sonner';
import { extendStatusCode } from '@/utils/export/statusUtils';

interface UseStatusLoaderResult {
  availableStatuses: StatusCode[];
  isLoading: boolean;
  refreshStatuses: () => void;
}

export function useStatusLoader(): UseStatusLoaderResult {
  const [availableStatuses, setAvailableStatuses] = useState<StatusCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const retryCountRef = useRef(0);
  const loadingTimeoutRef = useRef<number | null>(null);
  const isMounted = useRef(true);
  // Ajout d'un flag pour éviter les doubles chargements
  const isRefreshingRef = useRef(false);

  const loadStatusesFromSupabase = async () => {
    if (!isMounted.current || isRefreshingRef.current) return;
    
    isRefreshingRef.current = true;
    setIsLoading(true);
    
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    
    // Définir un délai maximum pour le chargement
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
      isRefreshingRef.current = false;
    }, 3000);
    
    try {
      console.log("Chargement des options de statut depuis Supabase...");
      
      const { data: statusData, error } = await supabase
        .from('statuts')
        .select('code, libelle, couleur')
        .order('display_order', { ascending: true });
      
      // Arrêter le timeout une fois les données récupérées
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
        // Important: mise à jour des dictionnaires STATUS_LABELS et STATUS_COLORS
        statusData.forEach(status => {
          if (status && status.code) {
            const statusCode = extendStatusCode(status.code);
            STATUS_LABELS[statusCode] = status.libelle || status.code;
            STATUS_COLORS[statusCode] = status.couleur || 'bg-gray-500 text-white';
          }
        });
        
        // Conversion des codes en StatusCode
        const supabaseStatuses = statusData
          .filter((status) => status && status.code && status.code.trim() !== '')
          .map((status) => extendStatusCode(status.code));
        
        console.log("Options de statut valides:", supabaseStatuses);
        setAvailableStatuses(supabaseStatuses);
      } else {
        console.log("Aucun statut trouvé, utilisation des valeurs par défaut");
        const defaultStatuses: StatusCode[] = [
          'none', 'assistance', 'vigi', 'formation', 'projet', 
          'conges', 'management', 'tp', 'coordinateur', 'absence',
          'regisseur', 'demenagement', 'permanence', 'parc'
        ];
        setAvailableStatuses(defaultStatuses);
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
      // Toujours mettre fin à l'état de chargement
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      if (isMounted.current) {
        setIsLoading(false);
      }
      isRefreshingRef.current = false;
    }
  };

  // Fonction pour déclencher un rafraîchissement manuel des statuts
  const refreshStatuses = () => {
    if (isRefreshingRef.current) {
      console.log("Rafraîchissement des statuts déjà en cours, ignoré");
      return;
    }
    console.log("Rafraîchissement manuel des statuts...");
    loadStatusesFromSupabase();
  };

  // Effet pour charger les données au montage du composant
  useEffect(() => {
    console.log("useStatusLoader: Montage du composant et initialisation");
    // Réinitialiser le state pour éviter les problèmes
    isMounted.current = true;
    isRefreshingRef.current = false;
    
    // Initialisation du chargement des statuts
    loadStatusesFromSupabase();
    
    // Écouter les événements de mise à jour des statuts
    const handleStatusesUpdated = (event: Event) => {
      const customEvent = event as CustomEvent;
      // Ignorer les événements provenant directement de la synchronisation
      // pour éviter les boucles infinies
      const fromSync = customEvent.detail?.fromSync === true;
      
      if (!fromSync && !isRefreshingRef.current) {
        console.log("Événement statusesUpdated reçu, rechargement des statuts");
        loadStatusesFromSupabase();
      } else {
        console.log("Événement statusesUpdated ignoré pour éviter une boucle");
      }
    };
    
    window.addEventListener('statusesUpdated', handleStatusesUpdated);
    
    // Configurer l'écoute des changements Supabase en temps réel
    const channel = supabase
      .channel('statuts-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'statuts' },
        (payload) => {
          if (isRefreshingRef.current) {
            console.log("Changement détecté dans la table statuts, mais ignoré car rechargement en cours");
            return;
          }
          console.log("Changement détecté dans la table statuts:", payload);
          loadStatusesFromSupabase();
        }
      )
      .subscribe();
    
    // Nettoyage lors du démontage
    return () => {
      console.log("useStatusLoader: Démontage du composant");
      isMounted.current = false;
      window.removeEventListener('statusesUpdated', handleStatusesUpdated);
      supabase.removeChannel(channel);
      
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, []);

  return { availableStatuses, isLoading, refreshStatuses };
}
