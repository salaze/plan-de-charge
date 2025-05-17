
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { checkSupabaseConnection } from '@/utils/supabase/connection';

export function useConnectionState() {
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);

  const checkConnection = useCallback(async () => {
    try {
      const connected = await checkSupabaseConnection();
      setIsConnected(connected);
      
      if (!connected) {
        const errorMsg = "Impossible de se connecter à Supabase. Veuillez vérifier votre connexion internet.";
        setConnectionError(errorMsg);
        return false;
      } else {
        setConnectionError(null);
        return true;
      }
    } catch (error) {
      console.error('Error checking connection:', error);
      setIsConnected(false);
      setConnectionError("Erreur lors de la vérification de la connexion");
      return false;
    }
  }, []);

  return {
    loading,
    setLoading,
    connectionError,
    setConnectionError,
    isConnected,
    setIsConnected,
    checkConnection
  };
}
