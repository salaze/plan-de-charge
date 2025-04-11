
import React from 'react';
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

export function SupabaseStatusIndicator() {
  // Use React.useState instead of the direct import to avoid potential issues
  const [isChecking, setIsChecking] = React.useState(false);
  const [isConnected, setIsConnected] = React.useState<boolean | null>(null);
  const [lastSyncTime, setLastSyncTime] = React.useState<Date | null>(null);
  
  // Define a standalone check connection function
  const checkConnection = React.useCallback(async () => {
    setIsChecking(true);
    try {
      const connected = await checkSupabaseTables();
      setIsConnected(connected);
      if (connected) {
        setLastSyncTime(new Date());
      }
      setIsChecking(false);
      return connected;
    } catch (error) {
      console.error("Erreur lors de la vérification de la connexion:", error);
      setIsConnected(false);
      setIsChecking(false);
      return false;
    }
  }, []);
  
  // Check connection on component mount
  React.useEffect(() => {
    let isMounted = true;
    
    const checkInitialConnection = async () => {
      if (isMounted) {
        await checkConnection();
      }
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
  }, [checkConnection]);
  
  const handleManualCheck = async () => {
    const connected = await checkConnection();
    
    if (connected) {
      toast.success("Connexion à Supabase établie");
    } else {
      toast.error("Impossible de se connecter à Supabase");
    }
  };

  // Format last sync time
  const formatLastSync = () => {
    if (!lastSyncTime) return "Jamais";
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(lastSyncTime);
  };

  // Show loading indicator if isConnected is null (initial state)
  if (isConnected === null) {
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
            className={`flex items-center text-xs px-2 py-1 h-auto ${isConnected ? 'text-green-500 hover:text-green-600' : 'text-red-500 hover:text-red-600'}`}
            onClick={handleManualCheck}
            disabled={isChecking}
          >
            {isChecking ? (
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            ) : isConnected ? (
              <Cloud className="h-3 w-3 mr-1" />
            ) : (
              <CloudOff className="h-3 w-3 mr-1" />
            )}
            <span>{isConnected ? 'Connecté' : 'Hors ligne'}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">État de la connexion Supabase</p>
            <div className="flex items-center text-xs">
              <span className="font-medium mr-1">Statut:</span>
              {isConnected ? (
                <span className="text-green-500 flex items-center">
                  Connecté
                </span>
              ) : (
                <span className="text-red-500">Déconnecté</span>
              )}
            </div>
            {lastSyncTime && (
              <div className="text-xs">
                <span className="font-medium">Dernière synchronisation:</span> {formatLastSync()}
              </div>
            )}
            {isChecking && (
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
