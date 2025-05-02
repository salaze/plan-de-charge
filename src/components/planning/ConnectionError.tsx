
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ConnectionErrorProps {
  errorMessage: string;
  onRefresh: () => void;
}

export function ConnectionError({ errorMessage, onRefresh }: ConnectionErrorProps) {
  return (
    <ScrollArea className="h-[calc(100vh-220px)]" type="always">
      <div className="glass-panel p-6 animate-scale-in min-w-max pr-4 pb-4">
        <div className="flex flex-col items-center justify-center text-center p-6">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-xl font-bold mb-2">Erreur de connexion</h3>
          <p className="text-muted-foreground mb-4">{errorMessage}</p>
          <div className="space-y-2">
            <Button onClick={onRefresh} className="w-full">Réessayer</Button>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="w-full">
              Recharger la page
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Si le problème persiste, vérifiez votre connexion internet ou contactez l'administrateur.
          </p>
        </div>
      </div>
    </ScrollArea>
  );
}
