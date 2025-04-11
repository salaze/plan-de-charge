
import React, { useState, useEffect } from 'react';
import { Database, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { checkSupabaseTables } from '@/utils/initSupabase';

// Create a class-based component version of SupabaseStatusIndicator to avoid potential hook issues
export function SupabaseStatusIndicator() {
  // Use regular React hooks but in a more direct way
  const [state, setState] = useState({
    isChecking: false,
    isConnected: null as boolean | null,
    lastSyncTime: null as Date | null
  });
  
  // Define a standalone check connection function
  const checkConnection = async () => {
    setState(prev => ({ ...prev, isChecking: true }));
    try {
      const connected = await checkSupabaseTables();
      setState(prev => ({ 
        ...prev, 
        isConnected: connected, 
        isChecking: false
      }));
      return connected;
    } catch (error) {
      console.error("Erreur lors de la vérification de la connexion:", error);
      setState(prev => ({ 
        ...prev, 
        isConnected: false, 
        isChecking: false
      }));
      return false;
    }
  };
  
  // Check connection on component mount
  useEffect(() => {
    let isMounted = true;
    
    const checkInitialConnection = async () => {
      if (!isMounted) return;
      await checkConnection();
    };
    
    checkInitialConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(() => {
      if (isMounted) {
        checkConnection();
      }
    }, 30000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);
  
  const handleManualCheck = async () => {
    const connected = await checkConnection();
    
    if (connected) {
      toast.success("Connexion à Supabase établie");
      setState(prev => ({ ...prev, lastSyncTime: new Date() }));
    } else {
      toast.error("Impossible de se connecter à Supabase");
    }
  };

  // Format last sync time
  const formatLastSync = () => {
    if (!state.lastSyncTime) return "Jamais";
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(state.lastSyncTime);
  };

  // Show loading indicator if isConnected is null (initial state)
  if (state.isConnected === null) {
    return (
      <div className="flex items-center text-muted-foreground text-xs">
        <Database className="h-3 w-3 mr-1 animate-pulse" />
        <span>Vérification...</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            className={`flex items-center text-xs px-2 py-1 h-auto ${state.isConnected ? 'text-green-500 hover:text-green-600' : 'text-red-500 hover:text-red-600'}`}
            onClick={handleManualCheck}
            disabled={state.isChecking}
          >
            {state.isChecking ? (
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            ) : state.isConnected ? (
              <Cloud className="h-3 w-3 mr-1" />
            ) : (
              <CloudOff className="h-3 w-3 mr-1" />
            )}
            <span>{state.isConnected ? 'Connecté' : 'Hors ligne'}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">État de la connexion Supabase</p>
            <div className="flex items-center text-xs">
              <span className="font-medium mr-1">Statut:</span>
              {state.isConnected ? (
                <span className="text-green-500 flex items-center">
                  Connecté
                </span>
              ) : (
                <span className="text-red-500">Déconnecté</span>
              )}
            </div>
            {state.lastSyncTime && (
              <div className="text-xs">
                <span className="font-medium">Dernière synchronisation:</span> {formatLastSync()}
              </div>
            )}
            {state.isChecking && (
              <div className="text-xs flex items-center">
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                <span>Synchronisation en cours...</span>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
