
import React from 'react';
import { Database, Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useSyncStatus } from '@/hooks/useSyncStatus';

export function SupabaseStatusIndicator() {
  // Wrap hook usage in try-catch in case there's an issue with React context
  try {
    const { isConnected, lastSyncTime, checkConnection, isSyncing } = useSyncStatus();
    
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
      <Button 
        variant="ghost" 
        size="sm"
        className={`flex items-center text-xs px-2 py-1 h-auto ${isConnected ? 'text-green-500 hover:text-green-600' : 'text-red-500 hover:text-red-600'}`}
        onClick={handleManualCheck}
        disabled={isSyncing}
        title={`Statut: ${isConnected ? 'Connecté' : 'Déconnecté'}${lastSyncTime ? `. Dernière synchronisation: ${formatLastSync()}` : ''}`}
      >
        {isSyncing ? (
          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
        ) : isConnected ? (
          <Cloud className="h-3 w-3 mr-1" />
        ) : (
          <CloudOff className="h-3 w-3 mr-1" />
        )}
        <span>{isConnected ? 'Connecté' : 'Hors ligne'}</span>
      </Button>
    );
  } catch (error) {
    // Fallback render in case of hook errors
    console.error("Error rendering SupabaseStatusIndicator:", error);
    return (
      <div className="flex items-center text-red-500 text-xs">
        <Database className="h-3 w-3 mr-1" />
        <span>Erreur</span>
      </div>
    );
  }
}
