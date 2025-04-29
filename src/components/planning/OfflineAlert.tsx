
import React from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface OfflineAlertProps {
  isOpen: boolean;
  onReconnect: () => void;
}

export function OfflineAlert({ isOpen, onReconnect }: OfflineAlertProps) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Connexion perdue à Supabase</AlertDialogTitle>
          <AlertDialogDescription>
            La connexion avec la base de données a été perdue. L'application ne peut pas fonctionner sans connexion internet. Vérifiez votre réseau et réessayez.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button onClick={onReconnect}>Reconnecter</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
