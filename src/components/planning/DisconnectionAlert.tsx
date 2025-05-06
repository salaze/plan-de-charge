
import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react';

interface DisconnectionAlertProps {
  isOpen: boolean;
  onReconnect: () => void;
}

export function DisconnectionAlert({ isOpen, onReconnect }: DisconnectionAlertProps) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader className="flex flex-row items-center gap-3">
          <WifiOff className="h-6 w-6 text-destructive" />
          <div>
            <AlertDialogTitle>Connexion perdue à Supabase</AlertDialogTitle>
            <AlertDialogDescription>
              La connexion avec la base de données a été perdue. L'application fonctionne actuellement en mode hors ligne limité.
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>
        
        <div className="py-3">
          <div className="flex items-start gap-2 mb-3 text-sm p-3 bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-300 rounded-md border border-amber-200 dark:border-amber-800">
            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Que pouvez-vous faire ?</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Vérifier votre connexion internet</li>
                <li>Essayer de vous reconnecter au serveur</li>
                <li>Recharger la page</li>
              </ul>
            </div>
          </div>
        </div>
        
        <AlertDialogFooter className="flex gap-3 sm:justify-between">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Recharger la page
          </Button>
          <Button onClick={onReconnect} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Reconnecter
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
