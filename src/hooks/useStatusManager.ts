
import { useState, useEffect } from 'react';
import { StatusCode, STATUS_LABELS, STATUS_COLORS, Status } from '@/types';
import { generateId } from '@/utils';
import { toast } from 'sonner';

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
    
    const statusToBeDeleted = statuses.find(status => status.id === statusToDelete);
    if (!statusToBeDeleted) {
      toast.error('Statut non trouvé');
      return;
    }
    
    const updatedStatuses = statuses.filter(status => status.id !== statusToDelete);
    onStatusesChange(updatedStatuses);
    
    toast.success(`Le statut "${statusToBeDeleted.label}" a été supprimé avec succès`);
    setDeleteDialogOpen(false);
    setStatusToDelete('');
  };

  const handleSaveStatus = (status: Status) => {
    try {
      let updatedStatuses: Status[];
      
      if (status.id) {
        // Update existing status
        updatedStatuses = statuses.map(s => 
          s.id === status.id ? status : s
        );
        
        // Update global objects
        STATUS_LABELS[status.code] = status.label;
        STATUS_COLORS[status.code] = status.color;
        
        toast.success(`Le statut "${status.label}" a été modifié avec succès`);
      } else {
        // Add new status with generated ID
        const newStatus: Status = {
          ...status,
          id: generateId(),
          displayOrder: status.displayOrder || statuses.length + 1
        };
        updatedStatuses = [...statuses, newStatus];
        
        // Update global STATUS_LABELS and STATUS_COLORS
        STATUS_LABELS[status.code] = status.label;
        STATUS_COLORS[status.code] = status.color;
        
        toast.success(`Le statut "${status.label}" a été ajouté avec succès`);
      }
      
      onStatusesChange(updatedStatuses);
      
      // Force localStorage update immediately
      const savedData = localStorage.getItem('planningData');
      const data = savedData ? JSON.parse(savedData) : {};
      localStorage.setItem('planningData', JSON.stringify({
        ...data,
        statuses: updatedStatuses
      }));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du statut:', error);
      toast.error('Une erreur est survenue lors de la sauvegarde du statut');
    }
  };
  
  // Get all existing status codes except the current one being edited
  const getExistingCodes = (): string[] => {
    return statuses
      .filter(s => s.id !== currentStatus?.id)
      .map(s => s.code);
  };
  
  // Fonction pour trier les statuts par ordre d'affichage
  const getSortedStatuses = (): Status[] => {
    return [...statuses].sort((a, b) => {
      const orderA = a.displayOrder || 999;
      const orderB = b.displayOrder || 999;
      return orderA - orderB;
    });
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
    getExistingCodes,
    getSortedStatuses
  };
}
