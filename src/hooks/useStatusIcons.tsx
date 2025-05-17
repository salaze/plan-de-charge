
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StatusCode } from '@/types';

interface StatusIcon {
  statusCode: StatusCode;
  url: string;
}

export function useStatusIcons() {
  const [icons, setIcons] = useState<StatusIcon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fonction pour récupérer les icônes depuis le bucket Supabase
  const fetchIcons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.storage.from('status-icons').list();
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        // Récupérer les URLs publiques pour chaque fichier
        const statusIcons = await Promise.all(
          data.map(async (file) => {
            const statusCode = file.name.split('.')[0] as StatusCode;
            const { data: { publicUrl } } = supabase.storage
              .from('status-icons')
              .getPublicUrl(file.name);
              
            return {
              statusCode,
              url: publicUrl
            };
          })
        );
        
        console.log('Status icons loaded:', statusIcons);
        setIcons(statusIcons);
      }
      
    } catch (err) {
      console.error('Error loading status icons:', err);
      setError(err instanceof Error ? err : new Error('Failed to load status icons'));
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les icônes au chargement du composant
  useEffect(() => {
    fetchIcons();
  }, []);

  // Obtenir l'URL d'une icône par code de statut
  const getIconUrl = useMemo(() => {
    return (statusCode: StatusCode) => {
      const icon = icons.find(icon => icon.statusCode === statusCode);
      return icon?.url;
    };
  }, [icons]);

  return {
    icons,
    loading,
    error,
    refreshIcons: fetchIcons,
    getIconUrl
  };
}
