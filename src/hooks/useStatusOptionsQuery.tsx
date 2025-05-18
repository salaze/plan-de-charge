
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StatusCode } from '@/types';
import { toast } from 'sonner';
import { useSupabaseSubscription } from './useSupabaseSubscription';

export const useStatusOptionsQuery = () => {
  // Définir la clé de requête
  const queryKey = ['statuses'];
  
  // S'abonner aux changements de la table statuts
  useSupabaseSubscription('statuts', queryKey);
  
  // Fonction pour charger les statuts depuis Supabase
  const fetchStatuses = async (): Promise<StatusCode[]> => {
    try {
      console.log('Fetching statuses from Supabase...');
      
      const { data, error } = await supabase
        .from('statuts')
        .select('*')
        .order('display_order', { ascending: true });
        
      if (error) {
        console.error('Error loading statuses:', error);
        toast.error('Erreur lors du chargement des statuts');
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.warn('No statuses found in database');
        // Retourner les statuts par défaut si aucun n'est trouvé
        return ['none', 'assistance', 'vigi', 'formation', 'projet', 'conges'];
      }
      
      // Convertir les données en codes de statut
      const statusCodes: StatusCode[] = data.map(status => status.code as StatusCode);
      
      // Ajouter le statut 'none' s'il n'est pas déjà présent
      if (!statusCodes.includes('none')) {
        statusCodes.push('none');
      }
      
      console.log(`${statusCodes.length} statuses loaded:`, statusCodes);
      return statusCodes;
    } catch (error) {
      console.error('Error fetching statuses:', error);
      // En cas d'erreur, retourner au moins les statuts par défaut
      return ['none', 'assistance', 'vigi', 'formation', 'projet', 'conges'];
    }
  };
  
  return useQuery({
    queryKey,
    queryFn: fetchStatuses,
    staleTime: 30 * 1000, // 30 secondes de cache (réduit pour détecter plus vite les changements)
    gcTime: 60 * 1000, // 60 secondes avant le nettoyage (remplacement de cacheTime)
    retry: 3, // Réessayer 3 fois en cas d'erreur
    refetchOnWindowFocus: true, // Actualiser automatiquement lorsque la fenêtre reprend le focus
    refetchOnMount: true, // Actualiser au montage du composant
  });
};
