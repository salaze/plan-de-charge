
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
import { Status } from '@/types';

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
    getExistingCodes,
    getSortedStatuses
  } = useStatusManager(statuses, onStatusesChange);
  
  // On utilise getSortedStatuses pour afficher les statuts triés
  const sortedStatuses = getSortedStatuses();
  
  return (
    <div className="w-full">
      <StatusList 
        statuses={sortedStatuses}
        onAddStatus={handleAddStatus}
        onEditStatus={handleEditStatus}
        onDeleteStatus={handleDeleteStatus}
      />
      
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
    </div>
  );
}
