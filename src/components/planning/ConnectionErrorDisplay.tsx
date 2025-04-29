
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConnectionErrorDisplayProps {
  errorMessage: string;
  onReconnect: () => void;
}

export function ConnectionErrorDisplay({ errorMessage, onReconnect }: ConnectionErrorDisplayProps) {
  return (
    <div className="glass-panel p-6 animate-scale-in">
      <div className="flex flex-col items-center justify-center text-center p-6">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-xl font-bold mb-2">Erreur de connexion</h3>
        <p className="text-muted-foreground mb-4">{errorMessage}</p>
        <Button onClick={onReconnect}>Réessayer</Button>
      </div>
    </div>
  );
}
