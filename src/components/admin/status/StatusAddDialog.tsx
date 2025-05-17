
import React, { useState } from 'react';
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

interface StatusAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddStatus: (status: Status) => void;
}

export function StatusAddDialog({ 
  open, 
  onOpenChange, 
  onAddStatus 
}: StatusAddDialogProps) {
  const [newStatus, setNewStatus] = useState<Status>({
    id: '',
    code: '' as StatusCode,
    label: '',
    color: ''
  });
  
  const { toast } = useToast();

  const handleAddStatus = () => {
    if (!newStatus.code || !newStatus.label || !newStatus.color) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      });
      return;
    }

    const newStatusWithId = { ...newStatus, id: newStatus.code };
    onAddStatus(newStatusWithId);
    
    // Reset form
    setNewStatus({ id: '', code: '' as StatusCode, label: '', color: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un statut</DialogTitle>
          <DialogDescription>
            Ajouter un nouveau statut à la liste.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="code" className="text-right">
              Code
            </Label>
            <Input
              id="code"
              value={newStatus.code}
              onChange={(e) => setNewStatus({ ...newStatus, code: e.target.value as StatusCode })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="label" className="text-right">
              Libellé
            </Label>
            <Input
              id="label"
              value={newStatus.label}
              onChange={(e) => setNewStatus({ ...newStatus, label: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="color" className="text-right">
              Couleur
            </Label>
            <ColorPicker
              color={newStatus.color}
              onChange={(color) => setNewStatus({ ...newStatus, color })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleAddStatus}>
            Ajouter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
