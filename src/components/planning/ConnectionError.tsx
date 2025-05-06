
import React from 'react';
import { AlertCircle, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface ConnectionErrorProps {
  errorMessage: string;
  onRefresh: () => void;
}

export function ConnectionError({ errorMessage, onRefresh }: ConnectionErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <Alert variant="destructive" className="max-w-md mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur de connexion</AlertTitle>
        <AlertDescription>
          {errorMessage}
        </AlertDescription>
      </Alert>
      
      <div className="flex flex-col items-center gap-6 mt-4">
        <WifiOff className="h-16 w-16 text-muted-foreground" />
        <p className="text-center text-muted-foreground">
          Impossible de se connecter au serveur Supabase. Cela peut être dû à:
        </p>
        <ul className="list-disc text-sm text-muted-foreground space-y-1 pl-5">
          <li>Une connexion internet instable</li>
          <li>Un problème temporaire avec le serveur</li>
          <li>Un pare-feu bloquant les connexions</li>
        </ul>
        
        <div className="flex flex-col space-y-2 w-full max-w-xs mt-4">
          <Button onClick={onRefresh} className="w-full flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Réessayer maintenant
          </Button>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="w-full">
            Recharger la page
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2">
          Si le problème persiste, vérifiez votre connexion internet ou contactez l'administrateur.
        </p>
      </div>
    </div>
  );
}
