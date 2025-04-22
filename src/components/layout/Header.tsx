
import React from "react";
import { AlertCircle, WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export function Header({ isSidebarOpen, setIsSidebarOpen }: HeaderProps) {
  const isOnline = useOnlineStatus();
  
  const handleRefresh = () => {
    window.location.reload();
  };
  
  return (
    <header className="flex items-center justify-between mb-4">
      <div className="flex items-center">
        <button
          className="md:hidden p-2"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Ouvrir/fermer le menu"
        >
          <span className="material-icons">{isSidebarOpen ? "close" : "menu"}</span>
        </button>
        <div className="text-lg font-bold text-primary">Planning des Employés</div>
      </div>
      
      {!isOnline && (
        <div className="flex items-center">
          <div className="flex items-center text-destructive mr-2">
            <WifiOff className="h-5 w-5 mr-2" />
            <span className="text-sm font-medium hidden sm:inline">Déconnecté du serveur</span>
          </div>
          <Button size="sm" variant="outline" onClick={handleRefresh}>
            Reconnecter
          </Button>
        </div>
      )}
    </header>
  );
}
