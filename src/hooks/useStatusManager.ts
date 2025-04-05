
import { useState, useEffect } from 'react';
import { StatusCode, STATUS_LABELS, STATUS_COLORS } from '@/types';
import { generateId } from '@/utils';
import { toast } from 'sonner';

interface Status {
  id: string;
  code: StatusCode;
  label: string;
  color: string;
}

export function useStatusManager(
  statuses: Status[],
  onStatusesChange: (statuses: Status[]) => void
) {
  const [formOpen, setFormOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<Status | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusToDelete, setStatusToDelete] = useState<string>('');

  // Update global STATUS_LABELS and STATUS_COLORS
  useEffect(() => {
    if (statuses && statuses.length > 0) {
      statuses.forEach((status) => {
        if (status.code) {
          STATUS_LABELS[status.code] = status.label;
          STATUS_COLORS[status.code] = status.color;
        }
      });
      
      // Save changes to localStorage immediately
      const savedData = localStorage.getItem('planningData');
      const data = savedData ? JSON.parse(savedData) : {};
      localStorage.setItem('planningData', JSON.stringify({
        ...data,
        statuses
      }));
    }
  }, [statuses]);

  const handleAddStatus = () => {
    setCurrentStatus(null);
    setFormOpen(true);
  };

  const handleEditStatus = (status: Status) => {
    setCurrentStatus(status);
    setFormOpen(true);
  };

  const handleDeleteStatus = (statusId: string) => {
    setStatusToDelete(statusId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteStatus = () => {
    if (!statusToDelete) return;
    
    const updatedStatuses = statuses.filter(status => status.id !== statusToDelete);
    onStatusesChange(updatedStatuses);
    
    toast.success('Statut supprimé avec succès');
    setDeleteDialogOpen(false);
    setStatusToDelete('');
  };

  const handleSaveStatus = (status: Status) => {
    let updatedStatuses: Status[];
    
    if (status.id) {
      // Update existing status
      updatedStatuses = statuses.map(s => 
        s.id === status.id ? status : s
      );
      
      // Update global objects
      STATUS_LABELS[status.code] = status.label;
      STATUS_COLORS[status.code] = status.color;
      
      toast.success('Statut modifié avec succès');
    } else {
      // Add new status with generated ID
      const newStatus: Status = {
        ...status,
        id: generateId()
      };
      updatedStatuses = [...statuses, newStatus];
      
      // Update global STATUS_LABELS and STATUS_COLORS
      STATUS_LABELS[status.code] = status.label;
      STATUS_COLORS[status.code] = status.color;
      
      toast.success('Statut ajouté avec succès');
    }
    
    onStatusesChange(updatedStatuses);
    
    // Force localStorage update immediately
    const savedData = localStorage.getItem('planningData');
    const data = savedData ? JSON.parse(savedData) : {};
    localStorage.setItem('planningData', JSON.stringify({
      ...data,
      statuses: updatedStatuses
    }));
  };
  
  // Get all existing status codes except the current one being edited
  const getExistingCodes = (): string[] => {
    return statuses
      .filter(s => s.id !== currentStatus?.id)
      .map(s => s.code);
  };

  return {
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
  };
}
