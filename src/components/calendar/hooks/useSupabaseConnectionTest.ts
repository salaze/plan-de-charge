
import { useState, useEffect } from 'react';
import { testSupabaseConnection } from '@/utils/initSupabase';

export function useSupabaseConnectionTest(isAdmin: boolean) {
  const [connectionTested, setConnectionTested] = useState(false);
  
  // Test connection to Supabase on component mount
  useEffect(() => {
    // Only test once
    if (!connectionTested && isAdmin) {
      const testConnection = async () => {
        try {
          await testSupabaseConnection();
          setConnectionTested(true);
        } catch (error) {
          console.error("Erreur lors du test de connexion:", error);
        }
      };
      
      testConnection();
    }
  }, [isAdmin, connectionTested]);
  
  return { connectionTested };
}
