
import React, { useState, useEffect } from 'react';
import { Database, Cloud, CloudOff } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function SupabaseStatusIndicator() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    checkConnection();

    // Vérifier la connexion toutes les 30 secondes
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    try {
      const { data, error } = await supabase.from('statuts').select('id').limit(1);
      
      if (error) {
        setIsConnected(false);
        console.error("Erreur de connexion à Supabase:", error);
      } else {
        setIsConnected(true);
      }
    } catch (error) {
      setIsConnected(false);
      console.error("Erreur lors de la vérification de la connexion:", error);
    }
  };

  if (isConnected === null) {
    return (
      <div className="flex items-center text-muted-foreground text-xs">
        <Database className="h-3 w-3 mr-1 animate-pulse" />
        <span>Vérification...</span>
      </div>
    );
  }

  return (
    <div 
      className={`flex items-center text-xs ${isConnected ? 'text-green-500' : 'text-red-500'}`}
      onClick={() => toast.info(isConnected ? "Connecté à la base de données" : "Mode hors ligne, connexion impossible")}
    >
      {isConnected ? (
        <>
          <Cloud className="h-3 w-3 mr-1" />
          <span>Connecté</span>
        </>
      ) : (
        <>
          <CloudOff className="h-3 w-3 mr-1" />
          <span>Hors ligne</span>
        </>
      )}
    </div>
  );
}
