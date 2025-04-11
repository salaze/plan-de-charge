
import React from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';

interface FilterActionsProps {
  onReset: () => void;
  onCancel: () => void;
  onApply: () => void;
}

export function FilterActions({ onReset, onCancel, onApply }: FilterActionsProps) {
  return (
    <DialogFooter>
      <Button variant="outline" onClick={onReset} className="mr-auto">
        Réinitialiser
      </Button>
      <Button variant="outline" onClick={onCancel}>
        Annuler
      </Button>
      <Button onClick={onApply}>
        Appliquer les filtres
      </Button>
    </DialogFooter>
  );
}
