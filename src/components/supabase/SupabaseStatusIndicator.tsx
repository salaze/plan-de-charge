
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
import { useSyncStatus } from '@/hooks/useSyncStatus';

export function SupabaseStatusIndicator() {
  // Initialize states locally first to avoid the "dispatcher is null" error
  const [isChecking, setIsChecking] = useState(false);
  const [localIsConnected, setLocalIsConnected] = useState<boolean | null>(null);
  const [localLastSyncTime, setLocalLastSyncTime] = useState<Date | null>(null);
  const [localIsSyncing, setLocalIsSyncing] = useState(false);
  
  // Use the hook inside a useEffect to ensure it's only called in a mounted component
  const { isConnected, isSyncing, lastSyncTime, checkConnection } = useSyncStatus();
  
  // Update local states when values from the hook change
  useEffect(() => {
    setLocalIsConnected(isConnected);
    setLocalIsSyncing(isSyncing || false);
    if (lastSyncTime) {
      setLocalLastSyncTime(lastSyncTime);
    }
  }, [isConnected, isSyncing, lastSyncTime]);

  const handleManualCheck = async () => {
    setIsChecking(true);
    await checkConnection();
    setIsChecking(false);
    
    if (isConnected) {
      toast.success("Connexion à Supabase établie");
    } else {
      toast.error("Impossible de se connecter à Supabase");
    }
  };

  // Format last sync time
  const formatLastSync = () => {
    if (!localLastSyncTime) return "Jamais";
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(localLastSyncTime);
  };

  // Show loading indicator if isConnected is null (initial state)
  if (localIsConnected === null) {
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
            className={`flex items-center text-xs px-2 py-1 h-auto ${localIsConnected ? 'text-green-500 hover:text-green-600' : 'text-red-500 hover:text-red-600'}`}
            onClick={handleManualCheck}
            disabled={isChecking}
          >
            {isChecking ? (
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            ) : localIsConnected ? (
              <Cloud className="h-3 w-3 mr-1" />
            ) : (
              <CloudOff className="h-3 w-3 mr-1" />
            )}
            <span>{localIsConnected ? 'Connecté' : 'Hors ligne'}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">État de la connexion Supabase</p>
            <div className="flex items-center text-xs">
              <span className="font-medium mr-1">Statut:</span>
              {localIsConnected ? (
                <span className="text-green-500 flex items-center">
                  Connecté
                </span>
              ) : (
                <span className="text-red-500">Déconnecté</span>
              )}
            </div>
            {localLastSyncTime && (
              <div className="text-xs">
                <span className="font-medium">Dernière synchronisation:</span> {formatLastSync()}
              </div>
            )}
            {localIsSyncing && (
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
