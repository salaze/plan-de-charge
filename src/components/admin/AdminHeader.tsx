
import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield, RefreshCw } from 'lucide-react';

interface AdminHeaderProps {
  onRefresh?: () => void;
  isOffline?: boolean;
  isLoading?: boolean;
}

export function AdminHeader({ onRefresh, isOffline = false, isLoading = false }: AdminHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
      <div>
        <h1 className="text-3xl font-bold flex items-center">
          <Shield className="mr-2 h-8 w-8 text-primary" />
          Administration
        </h1>
        <p className="text-muted-foreground">
          Gérez les projets, statuts, employés et paramètres système
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        {isOffline && (
          <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-md">
            Mode hors ligne
          </span>
        )}
        
        {onRefresh && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Rafraîchir</span>
          </Button>
        )}
      </div>
    </div>
  );
}
