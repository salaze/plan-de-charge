
import React from "react";
import { AlertCircle } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export function Header({ isSidebarOpen, setIsSidebarOpen }: HeaderProps) {
  const isOnline = useOnlineStatus();
  
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
        <div className="text-lg font-bold text-primary">Mon Application</div>
      </div>
      
      {!isOnline && (
        <div className="flex items-center text-destructive">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span className="text-sm font-medium">Déconnecté du serveur</span>
        </div>
      )}
    </header>
  );
}
