
import { useState } from 'react';
import { Status } from '@/components/admin/status/types';
import { useStatusForm } from './useStatusForm';

export function useStatusDialogs() {
  const [formOpen, setFormOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<Status | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusToDelete, setStatusToDelete] = useState<string>('');
  
  const { resetForm, ...formState } = useStatusForm({ currentStatus });

  const handleAddStatus = () => {
    setCurrentStatus(null);
    resetForm(null);
    setFormOpen(true);
  };

  const handleEditStatus = (status: Status) => {
    setCurrentStatus(status);
    resetForm(status);
    setFormOpen(true);
  };

  const handleDeleteStatus = (statusId: string) => {
    setStatusToDelete(statusId);
    setDeleteDialogOpen(true);
  };

  return {
    formOpen,
    currentStatus,
    deleteDialogOpen,
    statusToDelete,
    setFormOpen,
    setCurrentStatus,
    setDeleteDialogOpen,
    setStatusToDelete,
    handleAddStatus,
    handleEditStatus,
    handleDeleteStatus,
    ...formState
  };
}
