
import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface ConnectionLostDialogProps {
  open: boolean;
  onRetry: () => void;
}

export function ConnectionLostDialog({ open, onRetry }: ConnectionLostDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Connexion perdue à Supabase</AlertDialogTitle>
          <AlertDialogDescription>
            La connexion avec la base de données a été perdue. Vérifiez votre connexion internet et réessayez.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-end">
          <Button onClick={onRetry}>Réessayer</Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
