
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StatusCode } from '@/types';
import { toast } from 'sonner';

export const useAvailableStatuses = () => {
  const [statuses, setStatuses] = useState<StatusCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStatuses = async () => {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('statuts')
          .select('code')
          .order('display_order', { ascending: true });
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Extraire les codes de statut et filtrer pour s'assurer qu'ils sont valides
          const statusCodes = data
            .map(item => item.code as StatusCode)
            .filter(Boolean);
            
          console.log(`${statusCodes.length} statuts chargés depuis Supabase`);
          setStatuses(statusCodes);
        } else {
          console.log('Aucun statut trouvé dans Supabase');
          toast.error('Aucun statut trouvé dans la base de données');
          setStatuses([]);
        }
      } catch (err: any) {
        console.error('Erreur lors du chargement des statuts:', err);
        setError(err);
        setStatuses([]);
        
        // Si l'erreur est liée à la connexion réseau, afficher un message plus spécifique
        if (err.message?.includes('NetworkError')) {
          toast.error('Problème de connexion réseau lors du chargement des statuts.');
        } else {
          toast.error('Erreur lors du chargement des statuts depuis Supabase.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStatuses();
  }, []);
  
  return { statuses, isLoading, error };
};
