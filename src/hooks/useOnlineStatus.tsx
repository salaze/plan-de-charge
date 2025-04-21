
import { useState, useEffect } from 'react';
import { checkSupabaseConnection } from '@/utils/supabase/connection';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Vérifier la connexion au chargement
    const checkConnection = async () => {
      const connected = await checkSupabaseConnection();
      setIsOnline(connected);
    };
    
    checkConnection();
    
    // Vérifier périodiquement
    const intervalId = setInterval(checkConnection, 30000); // Toutes les 30 secondes
    
    // Écouter également les événements de connectivité du navigateur
    const handleOnline = () => {
      checkConnection(); // Revérifier la connexion à Supabase
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
};
