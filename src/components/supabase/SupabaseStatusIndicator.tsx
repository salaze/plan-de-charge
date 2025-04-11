
import React, { useState, useEffect } from 'react';
import { Database, Cloud, CloudOff, RefreshCw, Check } from 'lucide-react';
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
  // Properly use the hook to extract values
  const syncStatus = useSyncStatus();
  const { isConnected, isSyncing, lastSyncTime, checkConnection } = syncStatus;
  const [isChecking, setIsChecking] = useState(false);

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

  // Formater la date de dernière synchronisation
  const formatLastSync = () => {
    if (!lastSyncTime) return "Jamais";
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(lastSyncTime);
  };

  // Afficher un indicateur de chargement si isConnected est null (état initial)
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
                  <Check className="h-3 w-3 mr-1" />
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
            {isSyncing && (
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
