
import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Database, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { isSupabaseClientInitialized, checkSupabaseConnectionFast } from '@/utils/supabase/connectionChecker';

export function SupabaseStatusIndicator() {
  const { isConnected, lastSyncTime, checkConnection } = useSyncStatus();
  const [isChecking, setIsChecking] = useState(false);
  const lastCheckRef = useRef<number>(0);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Vérifier l'initialisation du client au chargement
  useEffect(() => {
    const clientInitialized = isSupabaseClientInitialized();
    if (!clientInitialized) {
      console.error("Client Supabase non correctement initialisé");
      toast.error("Erreur d'initialisation du client Supabase");
    }
  }, []);
  
  // Éviter les multiples vérifications en parallèle
  useEffect(() => {
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }
    
    // Si l'état est indéterminé (null), lancer une vérification automatique
    if (isConnected === null && !isChecking) {
      checkTimeoutRef.current = setTimeout(() => {
        handleRefreshClick(new Event('auto-check') as any);
      }, 1000);
    }
    
    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, [isConnected, isChecking]);
  
  const getStatusIcon = () => {
    if (isChecking) {
      return <RefreshCw className="h-4 w-4 animate-spin text-blue-400" />;
    } else if (isConnected === null) {
      return <AlertCircle className="h-4 w-4 text-yellow-400" />;
    } else if (isConnected) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };
  
  const getStatusText = () => {
    if (isChecking) {
      return "Vérification en cours...";
    } else if (isConnected === null) {
      return "Vérification de la connexion...";
    } else if (isConnected) {
      return lastSyncTime
        ? `Connecté à Supabase (dernière sync: ${new Date(lastSyncTime).toLocaleTimeString()})`
        : "Connecté à Supabase";
    } else {
      return "Non connecté à Supabase";
    }
  };
  
  const handleRefreshClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isChecking) return;
    
    // Éviter des clics multiples rapides
    const now = Date.now();
    if (now - lastCheckRef.current < 2000) {
      console.log("Vérification ignorée - trop rapprochée");
      return;
    }
    
    lastCheckRef.current = now;
    setIsChecking(true);
    toast.info("Vérification de la connexion Supabase...");
    
    try {
      // Utiliser la fonction de test de connexion rapide avec un délai maximum de 5 secondes
      const checkPromise = checkSupabaseConnectionFast();
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => reject(new Error("Timeout de la vérification")), 5000);
      });
      
      const fastResult = await Promise.race([checkPromise, timeoutPromise]);
      
      if (fastResult) {
        toast.success("Connexion à Supabase établie");
      } else {
        // Si le test rapide échoue, essayer avec la méthode plus complète
        const result = await checkConnection();
        if (result) {
          toast.success("Connexion à Supabase établie");
        } else {
          toast.error("Échec de connexion à Supabase");
        }
      }
    } catch (error) {
      console.error("Erreur lors de la vérification:", error);
      toast.error("Erreur lors de la vérification de la connexion");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <Button 
        variant="ghost" 
        size="sm" 
        className={cn(
          "rounded-full flex items-center space-x-1 px-2 py-1",
          isConnected ? "hover:bg-green-100 dark:hover:bg-green-900" : 
          isConnected === false ? "hover:bg-red-100 dark:hover:bg-red-900" :
          "hover:bg-yellow-100 dark:hover:bg-yellow-900"
        )}
        onClick={handleRefreshClick}
        title={getStatusText()}
        disabled={isChecking}
      >
        <Database className="h-4 w-4 mr-1" />
        {getStatusIcon()}
      </Button>
    </div>
  );
}
