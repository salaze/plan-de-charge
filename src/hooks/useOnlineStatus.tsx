
import { useState, useEffect } from 'react';
import { checkSupabaseConnection } from '@/utils/supabase/connection';
import { toast } from 'sonner';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Vérifier la connexion au chargement
    const checkConnection = async () => {
      if (isChecking) return;
      
      setIsChecking(true);
      try {
        const connected = await checkSupabaseConnection();
        
        if (isOnline !== connected) {
          if (connected) {
            toast.success('Connexion à Supabase rétablie');
          } else {
            toast.error('Connexion à Supabase perdue');
          }
          setIsOnline(connected);
        }
      } finally {
        setIsChecking(false);
      }
    };
    
    checkConnection();
    
    // Vérifier plus fréquemment, toutes les 15 secondes
    const intervalId = setInterval(checkConnection, 15000);
    
    // Écouter également les événements de connectivité du navigateur
    const handleOnline = () => {
      toast.info('Connexion internet rétablie, vérification de Supabase...');
      checkConnection();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Connexion internet perdue');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline, isChecking]);
  
  return isOnline;
};
