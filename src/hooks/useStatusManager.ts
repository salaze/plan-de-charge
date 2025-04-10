import { useState, useMemo } from 'react';
import { Status, StatusCode } from '@/types';
import { toast } from 'sonner';
import { statusService } from '@/services/supabaseServices';
import { generateId } from '@/utils/idUtils';

export function useStatusManager(initialStatuses: Status[], onStatusesChange: (statuses: Status[]) => void) {
  const [statuses, setStatuses] = useState<Status[]>(initialStatuses);
  const [formOpen, setFormOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<Status | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusToDelete, setStatusToDelete] = useState<string | null>(null);

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

    try {
      console.log('Deleting status with ID:', statusToDelete);
      const success = statusService.delete(statusToDelete);
      
      if (success) {
        const updatedStatuses = statuses.filter(s => s.id !== statusToDelete);
        setStatuses(updatedStatuses);
        onStatusesChange(updatedStatuses);
        toast.success('Statut supprimé avec succès');
      } else {
        toast.error('Erreur lors de la suppression du statut');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setDeleteDialogOpen(false);
      setStatusToDelete(null);
    }
  };

  const handleSaveStatus = (status: Status) => {
    try {
      console.log('Saving status:', status);
      
      if (status.id) {
        console.log('Updating existing status');
        const updatedStatus = statusService.update(status);
        
        if (updatedStatus) {
          console.log('Status updated successfully:', updatedStatus);
          const updatedStatuses = statuses.map(s => 
            s.id === status.id ? updatedStatus : s
          );
          setStatuses(updatedStatuses);
          onStatusesChange(updatedStatuses);
          setFormOpen(false);
          toast.success('Statut mis à jour avec succès');
        } else {
          toast.error('Erreur lors de la mise à jour du statut');
        }
      } else {
        console.log('Creating new status');
        const newStatusData: Omit<Status, "id"> = {
          code: status.code,
          label: status.label,
          color: status.color,
          displayOrder: status.displayOrder
        };
        
        const newStatus = statusService.create(newStatusData);
        
        if (newStatus) {
          console.log('Status created successfully:', newStatus);
          const updatedStatuses = [...statuses, newStatus];
          setStatuses(updatedStatuses);
          onStatusesChange(updatedStatuses);
          setFormOpen(false);
          toast.success('Statut ajouté avec succès');
        } else {
          toast.error('Erreur lors de l\'ajout du statut');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Une erreur est survenue');
    }
  };

  const getExistingCodes = (): string[] => {
    return statuses
      .filter(s => s.id !== currentStatus?.id)
      .map(s => s.code);
  };

  const getSortedStatuses = useMemo(() => {
    return () => {
      return [...statuses].sort((a, b) => {
        const orderA = a.displayOrder || 0;
        const orderB = b.displayOrder || 0;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        return a.label.localeCompare(b.label);
      });
    };
  }, [statuses]);

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
