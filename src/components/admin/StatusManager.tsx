
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { StatusList } from './status/StatusList';
import { StatusForm } from './status/StatusForm';
import { DeleteStatusDialog } from './status/DeleteStatusDialog';
import { useStatusManager } from '@/hooks/useStatusManager';
import { StatusCode } from '@/types';

interface Status {
  id: string;
  code: StatusCode;
  label: string;
  color: string;
}

interface StatusManagerProps {
  statuses: Status[];
  onStatusesChange: (statuses: Status[]) => void;
}

export function StatusManager({ statuses, onStatusesChange }: StatusManagerProps) {
  const {
    formOpen,
    setFormOpen,
    currentStatus,
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleAddStatus,
    handleEditStatus,
    handleDeleteStatus,
    confirmDeleteStatus,
    handleSaveStatus,
    getExistingCodes
  } = useStatusManager(statuses, onStatusesChange);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gestion des statuts</CardTitle>
        <CardDescription>
          Ajouter, modifier ou supprimer des statuts et leur code associé
        </CardDescription>
      </CardHeader>
      <CardContent>
        <StatusList 
          statuses={statuses}
          onAddStatus={handleAddStatus}
          onEditStatus={handleEditStatus}
          onDeleteStatus={handleDeleteStatus}
        />
      </CardContent>
      
      {/* Forms and dialogs */}
      <StatusForm 
        open={formOpen}
        onOpenChange={setFormOpen}
        onSave={handleSaveStatus}
        currentStatus={currentStatus}
        existingCodes={getExistingCodes()}
      />
      
      <DeleteStatusDialog 
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeleteStatus}
      />
    </Card>
  );
}
