
import { useState, useEffect } from 'react';
import { StatusCode } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAvailableStatuses = (defaultStatuses: StatusCode[] = []) => {
  const [statuses, setStatuses] = useState<StatusCode[]>(defaultStatuses);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Fonction pour récupérer les statuts depuis Supabase
    const loadStatusesFromSupabase = async () => {
      setIsLoading(true);
      try {
        console.log("Chargement des statuts depuis Supabase...");
        const { data, error } = await supabase
          .from('statuts')
          .select('code')
          .order('display_order', { ascending: true });
          
        if (error) {
          console.error("Erreur lors du chargement des statuts:", error);
          throw error;
        }
        
        console.log("Statuts récupérés:", data);
        
        // Si nous avons des statuts depuis Supabase, les utiliser
        if (Array.isArray(data) && data.length > 0) {
          const validStatuses = data
            .filter((s) => s && s.code) // S'assurer que chaque statut a un code
            .map((s) => s.code as StatusCode);
            
          console.log("Statuts valides:", validStatuses);
          setStatuses(validStatuses.length > 0 ? validStatuses : defaultStatuses);
        } else {
          // Si nous n'avons pas de statuts depuis Supabase, utiliser le localStorage
          console.log("Aucun statut trouvé dans Supabase, chargement depuis localStorage");
          loadStatusesFromLocalStorage();
        }
      } catch (error) {
        console.error('Error loading statuses from Supabase:', error);
        // En cas d'erreur, charger depuis localStorage
        loadStatusesFromLocalStorage();
      } finally {
        setIsLoading(false);
      }
    };
    
    // Fonction de secours pour charger les statuts depuis localStorage
    const loadStatusesFromLocalStorage = () => {
      try {
        const savedData = localStorage.getItem('planningData');
        const data = savedData ? JSON.parse(savedData) : { statuses: [] };
        
        console.log("Données du localStorage:", data);
        
        // Si nous avons des statuts personnalisés, extraire les codes
        if (Array.isArray(data.statuses) && data.statuses.length > 0) {
          const validStatuses = data.statuses
            .filter((s: any) => s && s.code) // S'assurer que chaque statut a un code
            .map((s: any) => s.code as StatusCode);
            
          console.log("Statuts valides depuis localStorage:", validStatuses);
          setStatuses(validStatuses.length > 0 ? validStatuses : defaultStatuses);
        } else {
          // Utiliser les statuts par défaut fournis
          console.log("Utilisation des statuts par défaut:", defaultStatuses);
          setStatuses(defaultStatuses);
        }
      } catch (error) {
        console.error('Error loading statuses from localStorage:', error);
        setStatuses(defaultStatuses); // Utiliser les statuts par défaut en cas d'erreur
      }
    };
    
    // Charger les statuts au montage du composant
    loadStatusesFromSupabase();
    
    // S'abonner aux changements en temps réel des statuts
    const channel = supabase
      .channel('available-statuses-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'statuts'
        },
        (payload) => {
          console.log('Status change detected, refreshing available statuses', payload);
          loadStatusesFromSupabase();
        }
      )
      .subscribe();
    
    // Écouter les changements dans le localStorage
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'planningData') {
        loadStatusesFromLocalStorage();
      }
    };
    
    // Écouter l'événement personnalisé pour les mises à jour de statuts
    const handleCustomEvent = () => loadStatusesFromSupabase();
    
    // Ajouter les écouteurs d'événements
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('statusesUpdated', handleCustomEvent);
    
    // Nettoyer les écouteurs lors du démontage
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('statusesUpdated', handleCustomEvent);
      supabase.removeChannel(channel);
    };
  }, [defaultStatuses]);
  
  return { statuses, isLoading };
};

export default useAvailableStatuses;
