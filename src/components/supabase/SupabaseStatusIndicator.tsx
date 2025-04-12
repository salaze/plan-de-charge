
import React from 'react';
import { Button } from '@/components/ui/button';
import { Database, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { cn } from '@/lib/utils';

export function SupabaseStatusIndicator() {
  const { isConnected, lastSyncTime, checkConnection } = useSyncStatus();
  
  const getStatusIcon = () => {
    if (isConnected === null) {
      return <AlertCircle className="h-4 w-4 text-yellow-400" />;
    } else if (isConnected) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };
  
  const getStatusText = () => {
    if (isConnected === null) {
      return "Vérification de la connexion...";
    } else if (isConnected) {
      return lastSyncTime
        ? `Connecté à Supabase (dernière sync: ${new Date(lastSyncTime).toLocaleTimeString()})`
        : "Connecté à Supabase";
    } else {
      return "Non connecté à Supabase";
    }
  };
  
  const handleRefreshClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    checkConnection();
  };

  return (
    <div className="relative inline-flex items-center">
      <Button 
        variant="ghost" 
        size="sm" 
        className={cn(
          "rounded-full flex items-center space-x-1 px-2 py-1",
          isConnected ? "hover:bg-green-100 dark:hover:bg-green-900" : "hover:bg-red-100 dark:hover:bg-red-900"
        )}
        onClick={handleRefreshClick}
        title={getStatusText()}
      >
        <Database className="h-4 w-4 mr-1" />
        {getStatusIcon()}
      </Button>
    </div>
  );
}
