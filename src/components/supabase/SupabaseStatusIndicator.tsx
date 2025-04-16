
import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Database, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useSyncStatus, CONNECTION_STATUS_EVENT } from '@/hooks/useSyncStatus';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { isSupabaseClientInitialized } from '@/utils/supabase/connection';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function SupabaseStatusIndicator() {
  const syncStatus = useSyncStatus();
  const { isConnected, lastSyncTime, checkConnection } = syncStatus;
  const [isChecking, setIsChecking] = useState(false);
  const lastCheckRef = useRef<number>(0);
  
  // Vérifier l'initialisation du client au chargement une seule fois
  useEffect(() => {
    const clientInitialized = isSupabaseClientInitialized();
    if (!clientInitialized) {
      console.error("Client Supabase non correctement initialisé");
      toast.error("Erreur d'initialisation du client Supabase");
    }
  }, []);
  
  // Écouter les événements de changement de statut de connexion
  useEffect(() => {
    const handleConnectionChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log("Changement de statut de connexion détecté:", customEvent.detail);
    };
    
    window.addEventListener(CONNECTION_STATUS_EVENT, handleConnectionChange);
    return () => {
      window.removeEventListener(CONNECTION_STATUS_EVENT, handleConnectionChange);
    };
  }, []);
  
  const handleCheckConnection = async () => {
    // Limiter les vérifications manuelles à une fois toutes les 2 secondes
    const now = Date.now();
    if (now - lastCheckRef.current < 2000) {
      toast.info("Veuillez attendre avant de vérifier à nouveau");
      return;
    }
    
    lastCheckRef.current = now;
    setIsChecking(true);
    
    try {
      const result = await checkConnection(true);
      if (result) {
        toast.success("Connexion à Supabase établie");
      } else {
        toast.error("Impossible de se connecter à Supabase");
      }
    } finally {
      setIsChecking(false);
    }
  };
  
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
      return "Vérification...";
    } else if (isConnected === null) {
      return "Statut inconnu";
    } else if (isConnected) {
      return lastSyncTime
        ? `Connecté (sync: ${new Date(lastSyncTime).toLocaleTimeString()})`
        : "Connecté";
    } else {
      return "Non connecté";
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "rounded-full flex items-center space-x-1 px-2 py-1",
              isConnected ? "hover:bg-green-100 dark:hover:bg-green-900" : 
              isConnected === false ? "hover:bg-red-100 dark:hover:bg-red-900" :
              "hover:bg-yellow-100 dark:hover:bg-yellow-900"
            )}
            title={getStatusText()}
            onClick={handleCheckConnection}
            disabled={isChecking}
          >
            <Database className="h-4 w-4 mr-1" />
            {getStatusIcon()}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getStatusText()}</p>
          <p className="text-xs text-gray-500">Cliquez pour vérifier la connexion</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
