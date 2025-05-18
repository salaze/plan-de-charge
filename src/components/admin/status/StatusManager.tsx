
import React, { useState, useEffect } from 'react';
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
import { useStatusManager } from '@/hooks/status/useStatusManager';

export function StatusManager({
  statuses,
  onStatusesChange,
  isLoading,
  isConnected
}: StatusManagerProps) {
  const { 
    formOpen, 
    currentStatus, 
    deleteDialogOpen, 
    code, 
    label, 
    color,
    isSaving,
    setFormOpen, 
    setCode, 
    setLabel, 
    setColor, 
    handleAddStatus, 
    handleEditStatus, 
    handleDeleteStatus, 
    handleConfirmDelete, 
    handleSaveStatus, 
    setDeleteDialogOpen 
  } = useStatusManager({ statuses, onStatusesChange, isConnected });

  // Ajouter un effet pour recharger les statuts quand la connexion est rétablie
  useEffect(() => {
    if (isConnected) {
      // Émettre un événement pour forcer le rechargement des statuts
      const event = new CustomEvent('statusesUpdated');
      window.dispatchEvent(event);
    }
  }, [isConnected]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestion des statuts</h2>
          <p className="text-muted-foreground">
            Configurez les statuts disponibles pour le planning
          </p>
          {!isConnected && (
            <p className="text-amber-500 text-sm mt-1">
              Mode hors ligne: les modifications ne seront pas synchronisées avec la base de données
            </p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <GenerateStatusIconsButton />
          <ExportStatusesButton statuses={statuses} />
          <ImportStatusesButton onStatusesImported={onStatusesChange} />
          <Button onClick={handleAddStatus} disabled={isSaving}>
            {isSaving ? 'Traitement en cours...' : 'Ajouter un statut'}
          </Button>
        </div>
      </div>

      <StatusTable
        statuses={statuses}
        onEditStatus={handleEditStatus}
        onDeleteStatus={handleDeleteStatus}
      />

      <StatusAddDialog
        open={formOpen && !currentStatus}
        onOpenChange={(open) => !isSaving && setFormOpen(open)}
        code={code}
        label={label}
        color={color}
        onCodeChange={setCode}
        onLabelChange={setLabel}
        onColorChange={setColor}
        onSubmit={handleSaveStatus}
        isLoading={isSaving}
      />

      <StatusEditDialog
        open={formOpen && !!currentStatus}
        onOpenChange={(open) => !isSaving && setFormOpen(open)}
        code={code}
        label={label}
        color={color}
        onCodeChange={setCode}
        onLabelChange={setLabel}
        onColorChange={setColor}
        onSubmit={handleSaveStatus}
        isLoading={isSaving}
      />
    </div>
  );
}
