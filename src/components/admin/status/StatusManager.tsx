
import React, { useState, useEffect, useCallback } from 'react';
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { useToast } from "@/components/ui/use-toast";
import { StatusTable } from './StatusTable';
import { ColorPicker } from './ColorPicker';
import { StatusManagerProps, Status } from './types';
import { GenerateStatusIconsButton } from '../actions/GenerateStatusIconsButton';
import { StatusCode } from '@/types';

export function StatusManager({
  statuses,
  onStatusesChange,
  isLoading,
  isConnected
}: StatusManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<Status>({
    id: '',
    code: '' as StatusCode,
    label: '',
    color: ''
  });
  const [editStatus, setEditStatus] = useState<Status | null>(null);
  const { toast } = useToast();

  const handleAddStatus = async () => {
    if (!newStatus.code || !newStatus.label || !newStatus.color) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      });
      return;
    }

    const newStatusWithId = { ...newStatus, id: newStatus.code };

    onStatusesChange([...statuses, newStatusWithId]);
    setNewStatus({ id: '', code: '' as StatusCode, label: '', color: '' });
    setIsAddDialogOpen(false);

    toast({
      title: "Succès",
      description: "Statut ajouté avec succès.",
    });
  };

  const handleEditStatus = async () => {
    if (!editStatus?.code || !editStatus?.label || !editStatus?.color) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      });
      return;
    }

    if (!editStatus) return;

    const updatedStatuses = statuses.map((status) =>
      status.id === editStatus.id ? editStatus : status
    );
    onStatusesChange(updatedStatuses);
    setEditStatus(null);
    setIsEditDialogOpen(false);

    toast({
      title: "Succès",
      description: "Statut mis à jour avec succès.",
    });
  };

  const handleDeleteStatus = async (id: string) => {
    const updatedStatuses = statuses.filter((status) => status.id !== id);
    onStatusesChange(updatedStatuses);

    toast({
      title: "Succès",
      description: "Statut supprimé avec succès.",
    });
  };

  const onEditStatus = (status: Status) => {
    setEditStatus(status);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestion des statuts</h2>
          <p className="text-muted-foreground">
            Configurez les statuts disponibles pour le planning
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <GenerateStatusIconsButton />
          <Button onClick={() => setIsAddDialogOpen(true)}>Ajouter un statut</Button>
        </div>
      </div>

      <StatusTable
        statuses={statuses}
        onEditStatus={onEditStatus}
        onDeleteStatus={handleDeleteStatus}
      />

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
                value={editStatus?.code || ''}
                onChange={(e) => setEditStatus({ ...editStatus, code: e.target.value as StatusCode } as Status)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="label" className="text-right">
                Libellé
              </Label>
              <Input
                id="label"
                value={editStatus?.label || ''}
                onChange={(e) => setEditStatus({ ...editStatus, label: e.target.value } as Status)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="color" className="text-right">
                Couleur
              </Label>
              <ColorPicker
                color={editStatus?.color || ''}
                onChange={(color) => setEditStatus({ ...editStatus, color } as Status)}
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
    </div>
  );
}
