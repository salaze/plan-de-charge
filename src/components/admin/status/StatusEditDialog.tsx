
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StatusForm } from './StatusForm';
import { Loader2 } from 'lucide-react';
import { StatusCode } from '@/types';

interface StatusEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  code: string;
  label: string;
  color: string;
  onCodeChange: (code: StatusCode) => void;
  onLabelChange: (label: string) => void;
  onColorChange: (color: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  isLoading?: boolean;
}

export function StatusEditDialog({ 
  open, 
  onOpenChange, 
  code,
  label,
  color,
  onCodeChange,
  onLabelChange,
  onColorChange,
  onSubmit,
  isLoading = false
}: StatusEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier le statut</DialogTitle>
        </DialogHeader>
        
        <StatusForm
          code={code as StatusCode}
          label={label}
          color={color}
          onCodeChange={onCodeChange}
          onLabelChange={onLabelChange}
          onColorChange={onColorChange}
          onSubmit={onSubmit}
          onClose={() => onOpenChange(false)}
        />
        
        <DialogFooter className="gap-2 sm:justify-between sm:gap-0">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isLoading}>
              Annuler
            </Button>
          </DialogClose>
          <Button type="submit" onClick={onSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              'Enregistrer'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
