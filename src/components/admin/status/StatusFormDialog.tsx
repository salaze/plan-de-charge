
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { StatusForm } from './StatusForm';
import { StatusCode } from '@/types';

interface StatusFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: { id: string; code: StatusCode; label: string; color: string } | null;
  code: StatusCode;
  setCode: (code: StatusCode) => void;
  label: string;
  setLabel: (label: string) => void;
  color: string;
  setColor: (color: string) => void;
  onSave: (e: React.FormEvent) => void;
  colorOptions: { value: string; label: string }[];
}

export function StatusFormDialog({
  isOpen,
  onClose,
  currentStatus,
  code,
  setCode,
  label,
  setLabel,
  color,
  setColor,
  onSave,
  colorOptions
}: StatusFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {currentStatus ? 'Modifier un statut' : 'Ajouter un statut'}
          </DialogTitle>
          <DialogDescription>
            {currentStatus 
              ? 'Modifiez les détails du statut existant' 
              : 'Complétez les informations pour ajouter un nouveau statut'}
          </DialogDescription>
        </DialogHeader>
        
        <StatusForm
          code={code}
          setCode={setCode}
          label={label}
          setLabel={setLabel}
          color={color}
          setColor={setColor}
          onSubmit={onSave}
          onCancel={onClose}
          colorOptions={colorOptions}
        />
      </DialogContent>
    </Dialog>
  );
}

export default StatusFormDialog;
