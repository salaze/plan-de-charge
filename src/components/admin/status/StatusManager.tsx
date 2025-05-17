
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import { StatusTable } from './StatusTable';
import { Status } from './types';
import { GenerateStatusIconsButton } from '../actions/GenerateStatusIconsButton';
import { StatusAddDialog } from './StatusAddDialog';
import { StatusEditDialog } from './StatusEditDialog';
import { StatusManagerProps } from './types';
import { ExportStatusesButton } from '../actions/ExportStatusesButton';
import { ImportStatusesButton } from '../actions/ImportStatusesButton';

export function StatusManager({
  statuses,
  onStatusesChange,
  isLoading,
  isConnected
}: StatusManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<Status | null>(null);
  const { toast } = useToast();

  const handleAddStatus = (newStatus: Status) => {
    onStatusesChange([...statuses, newStatus]);
    setIsAddDialogOpen(false);

    toast({
      title: "Succès",
      description: "Statut ajouté avec succès.",
    });
  };

  const handleEditStatus = (editedStatus: Status) => {
    const updatedStatuses = statuses.map((status) =>
      status.id === editedStatus.id ? editedStatus : status
    );
    
    onStatusesChange(updatedStatuses);
    setEditStatus(null);
    setIsEditDialogOpen(false);

    toast({
      title: "Succès",
      description: "Statut mis à jour avec succès.",
    });
  };

  const handleDeleteStatus = (id: string) => {
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
          <ExportStatusesButton statuses={statuses} />
          <ImportStatusesButton onStatusesImported={onStatusesChange} />
          <Button onClick={() => setIsAddDialogOpen(true)}>Ajouter un statut</Button>
        </div>
      </div>

      <StatusTable
        statuses={statuses}
        onEditStatus={onEditStatus}
        onDeleteStatus={handleDeleteStatus}
      />

      <StatusAddDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddStatus={handleAddStatus}
      />

      <StatusEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        status={editStatus}
        onEditStatus={handleEditStatus}
      />
    </div>
  );
}
