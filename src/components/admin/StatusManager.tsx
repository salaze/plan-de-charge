
import React, { useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { StatusCode, STATUS_LABELS, STATUS_COLORS } from '@/types';
import { StatusToolbar } from './status/StatusToolbar';
import { StatusTable } from './status/StatusTable';
import { StatusFormDialog } from './status/StatusFormDialog';
import { DeleteStatusDialog } from './status/DeleteStatusDialog';
import { useStatusManagement } from './status/useStatusManagement';

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
    code,
    setCode,
    label,
    setLabel,
    color,
    setColor,
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleAddStatus,
    handleEditStatus,
    handleDeleteStatus,
    confirmDeleteStatus,
    handleSaveStatus,
    colorOptions
  } = useStatusManagement(statuses, onStatusesChange);
  
  useEffect(() => {
    if (statuses && statuses.length > 0) {
      statuses.forEach((status) => {
        if (status.code) {
          STATUS_LABELS[status.code] = status.label;
          STATUS_COLORS[status.code] = status.color;
        }
      });
      
      const event = new CustomEvent('statusesUpdated');
      window.dispatchEvent(event);
    }
  }, [statuses]);
  
  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Gestion des statuts</CardTitle>
          <CardDescription>
            Ajouter, modifier ou supprimer des statuts et leur code associé
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatusToolbar onAddStatus={handleAddStatus} />
          <StatusTable 
            statuses={statuses} 
            onEdit={handleEditStatus} 
            onDelete={handleDeleteStatus}
          />
        </CardContent>
      </Card>
      
      <StatusFormDialog 
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        currentStatus={currentStatus}
        code={code}
        setCode={setCode}
        label={label}
        setLabel={setLabel}
        color={color}
        setColor={setColor}
        onSave={handleSaveStatus}
        colorOptions={colorOptions}
      />
      
      <DeleteStatusDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDeleteStatus}
      />
    </>
  );
}

export default StatusManager;
