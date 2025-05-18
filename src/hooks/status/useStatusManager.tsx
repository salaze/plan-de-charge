
import { useEffect } from 'react';
import { Status } from '@/components/admin/status/types';
import { useStatusDialogs } from './useStatusDialogs';
import { useStatusOperations } from './useStatusOperations';

interface UseStatusManagerProps {
  statuses: Status[];
  onStatusesChange: (statuses: Status[]) => void;
  isConnected: boolean;
}

export function useStatusManager({ statuses, onStatusesChange, isConnected }: UseStatusManagerProps) {
  const { 
    formOpen, 
    currentStatus, 
    deleteDialogOpen, 
    statusToDelete,
    code,
    label,
    color,
    setFormOpen, 
    setDeleteDialogOpen,
    handleAddStatus,
    handleEditStatus,
    handleDeleteStatus,
    setCode,
    setLabel,
    setColor
  } = useStatusDialogs();

  const { 
    isSaving, 
    handleSaveStatus, 
    handleConfirmDelete 
  } = useStatusOperations({ statuses, onStatusesChange, isConnected });

  // Ajouter un effet pour recharger les statuts quand la connexion est rétablie
  useEffect(() => {
    if (isConnected) {
      // Émettre un événement pour forcer le rechargement des statuts
      const event = new CustomEvent('statusesUpdated');
      window.dispatchEvent(event);
    }
  }, [isConnected]);

  // Wrapper for save status to pass current form state
  const onSubmitForm = (e: React.FormEvent) => {
    return handleSaveStatus(e, { currentStatus, code, label, color });
  };

  // Wrapper for confirm delete to pass current status to delete
  const onConfirmDelete = () => {
    return handleConfirmDelete(statusToDelete);
  };

  return {
    // Form state
    formOpen,
    currentStatus,
    deleteDialogOpen,
    code,
    label,
    color,
    isSaving,
    
    // Setters
    setFormOpen,
    setCode,
    setLabel,
    setColor,
    setDeleteDialogOpen,
    
    // Actions
    handleAddStatus,
    handleEditStatus,
    handleDeleteStatus,
    handleSaveStatus: onSubmitForm,
    handleConfirmDelete: onConfirmDelete,
  };
}
