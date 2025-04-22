
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Plus, Wifi, WifiOff } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusTable } from './StatusTable';
import { StatusForm } from './StatusForm';
import { DeleteDialog } from './DeleteDialog';
import { useStatusManager } from '@/hooks/status/useStatusManager';
import type { Status } from './types';

interface StatusManagerProps {
  statuses: Status[];
  onStatusesChange: (statuses: Status[]) => void;
  isLoading?: boolean;
  isConnected?: boolean;
}

export function StatusManager({
  statuses,
  onStatusesChange,
  isLoading = false,
  isConnected = true
}: StatusManagerProps) {
  const {
    formOpen,
    currentStatus,
    deleteDialogOpen,
    code,
    label,
    color,
    setFormOpen,
    setCode,
    setLabel,
    setColor,
    handleAddStatus,
    handleEditStatus,
    handleDeleteStatus,
    handleConfirmDelete,
    handleSaveStatus,
    setDeleteDialogOpen,
  } = useStatusManager({ statuses, onStatusesChange, isConnected });

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Gestion des statuts</CardTitle>
          <CardDescription>
            Ajouter, modifier ou supprimer des statuts et leur code associé
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Gestion des statuts</CardTitle>
            <CardDescription>
              Ajouter, modifier ou supprimer des statuts et leur code associé
            </CardDescription>
          </div>
          <div className="flex items-center">
            {isConnected ? (
              <div className="flex items-center text-xs text-green-600 font-medium mr-4">
                <Wifi className="h-3 w-3 mr-1" />
                <span>Connecté</span>
              </div>
            ) : (
              <div className="flex items-center text-xs text-amber-600 font-medium mr-4">
                <WifiOff className="h-3 w-3 mr-1" />
                <span>Hors ligne</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button onClick={handleAddStatus} className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un statut
            </Button>
          </div>
          
          <StatusTable
            statuses={statuses}
            onEditStatus={handleEditStatus}
            onDeleteStatus={handleDeleteStatus}
          />
        </CardContent>
      </Card>
      
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <StatusForm
            code={code}
            label={label}
            color={color}
            onCodeChange={setCode}
            onLabelChange={setLabel}
            onColorChange={setColor}
            onSubmit={handleSaveStatus}
            onClose={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

