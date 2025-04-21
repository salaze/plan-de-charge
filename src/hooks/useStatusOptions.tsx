
import { useState, useEffect } from 'react';
import { StatusCode } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StatusOption {
  value: StatusCode;
  label: string;
}

export function useStatusOptions() {
  const [availableStatuses, setAvailableStatuses] = useState<StatusOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Fonction pour charger les statuts depuis Supabase
    const loadStatusesFromSupabase = async () => {
      setIsLoading(true);
      try {
        console.log("Chargement des options de statut depuis Supabase...");
        // Utiliser un mécanisme de timeout pour éviter des attentes trop longues
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 secondes de timeout
        
        const { data: statusData, error } = await supabase
          .from('statuts')
          .select('code, libelle')
          .order('display_order', { ascending: true })
          .abortSignal(controller.signal);
          
        clearTimeout(timeoutId);
        
        if (error) {
          console.error("Erreur lors du chargement des options de statut:", error);
          throw error;
        }
        
        console.log("Options de statut récupérées:", statusData);
        
        if (Array.isArray(statusData) && statusData.length > 0) {
          const supabaseStatuses = statusData
            .filter((status) => status && status.code && status.code.trim() !== '') // Filtrer les codes vides
            .map((status) => ({
              value: status.code as StatusCode,
              label: status.libelle || status.code || 'Status'
            }));
          
          console.log("Options de statut valides:", supabaseStatuses);
          setAvailableStatuses([
            { value: 'none', label: 'Aucun' },
            ...supabaseStatuses
          ]);
        } else {
          toast.error("Aucun statut trouvé dans la base de données");
          // Statuts par défaut minimaux au cas où
          setAvailableStatuses([
            { value: 'none', label: 'Aucun' }
          ]);
        }
      } catch (error) {
        console.error('Error loading status options from Supabase:', error);
        toast.error("Erreur lors du chargement des options de statut");
        // Statut par défaut minimal en cas d'erreur
        setAvailableStatuses([
          { value: 'none', label: 'Aucun' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Charger les statuts immédiatement
    loadStatusesFromSupabase();
    
    // S'abonner aux changements en temps réel des statuts
    const channel = supabase
      .channel('status-options-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'statuts'
        },
        (payload) => {
          console.log('Status change detected, refreshing options', payload);
          loadStatusesFromSupabase();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  return { availableStatuses, isLoading };
}

export default useStatusOptions;
