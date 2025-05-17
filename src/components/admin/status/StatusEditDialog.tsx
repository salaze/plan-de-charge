
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ColorPicker } from './ColorPicker';
import { Status } from './types';
import { StatusCode } from '@/types';
import { useToast } from "@/components/ui/use-toast";

interface StatusEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: Status | null;
  onEditStatus: (status: Status) => void;
}

export function StatusEditDialog({
  open,
  onOpenChange,
  status,
  onEditStatus,
}: StatusEditDialogProps) {
  const [editStatus, setEditStatus] = useState<Status | null>(null);
  const { toast } = useToast();

  // Update local state when the passed status changes
  useEffect(() => {
    if (status) {
      setEditStatus(status);
    }
  }, [status]);

  const handleEditStatus = () => {
    if (!editStatus?.code || !editStatus?.label || !editStatus?.color) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      });
      return;
    }

    if (editStatus) {
      onEditStatus(editStatus);
      onOpenChange(false);
    }
  };

  if (!editStatus) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier un statut</DialogTitle>
          <DialogDescription>
            Modifier un statut existant dans la liste.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="code" className="text-right">
              Code
            </Label>
            <Input
              id="code"
              value={editStatus.code || ''}
              onChange={(e) => setEditStatus({ ...editStatus, code: e.target.value as StatusCode })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="label" className="text-right">
              Libellé
            </Label>
            <Input
              id="label"
              value={editStatus.label || ''}
              onChange={(e) => setEditStatus({ ...editStatus, label: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="color" className="text-right">
              Couleur
            </Label>
            <ColorPicker
              color={editStatus.color || ''}
              onChange={(color) => setEditStatus({ ...editStatus, color })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleEditStatus}>
            Modifier
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
