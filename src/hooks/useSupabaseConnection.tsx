
import { useState, useEffect } from 'react';
import { checkSupabaseConnection } from '@/utils/supabase/connection';
import { toast } from 'sonner';

export const useSupabaseConnection = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const checkConnection = async () => {
    setIsLoading(true);
    setConnectionError(null);
    try {
      const isConnected = await checkSupabaseConnection();
      setIsConnected(isConnected);
      
      if (!isConnected) {
        const errorMsg = "Impossible de se connecter à Supabase. Veuillez vérifier votre connexion internet.";
        setConnectionError(errorMsg);
        toast.error(errorMsg);
      }
      
      return isConnected;
    } catch (error) {
      console.error('Erreur de connexion inattendue:', error);
      const errorMsg = "Erreur de connexion à Supabase.";
      setConnectionError(errorMsg);
      toast.error(errorMsg);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isConnected,
    isLoading,
    connectionError,
    checkConnection,
    setConnectionError,
    setIsLoading
  };
};
