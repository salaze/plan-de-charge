
import { useState } from 'react';
import { StatusCode, STATUS_LABELS, STATUS_COLORS, Status } from '@/types';
import { generateId } from '@/utils';
import { toast } from 'sonner';
import { statusService } from '@/services/jsonStorage';

export function useStatusManager(
  statuses: Status[],
  onStatusesChange: (statuses: Status[]) => void
) {
  const [formOpen, setFormOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<Status | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusToDelete, setStatusToDelete] = useState<string>('');

  // Mettre à jour les labels et couleurs globaux
  const updateGlobalStatusConfig = (status: Status) => {
    if (status.code) {
      STATUS_LABELS[status.code] = status.label;
      STATUS_COLORS[status.code] = status.color;
    }
  };

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
    
    // Suppression via le service
    const success = statusService.delete(statusToDelete);
    
    if (success) {
      const updatedStatuses = statuses.filter(status => status.id !== statusToDelete);
      onStatusesChange(updatedStatuses);
      
      toast.success(`Le statut "${statusToBeDeleted.label}" a été supprimé avec succès`);
      setDeleteDialogOpen(false);
      setStatusToDelete('');
    } else {
      toast.error('Erreur lors de la suppression du statut');
    }
  };

  const handleSaveStatus = (status: Status) => {
    try {
      let updatedStatuses: Status[];
      
      if (status.id) {
        // Mise à jour via le service
        const updatedStatus = statusService.update(status);
        
        updatedStatuses = statuses.map(s => 
          s.id === status.id ? updatedStatus : s
        );
        
        updateGlobalStatusConfig(updatedStatus);
        toast.success(`Le statut "${status.label}" a été modifié avec succès`);
      } else {
        // Création via le service
        const newStatus: Status = {
          ...status,
          id: generateId(),
          displayOrder: status.displayOrder || statuses.length + 1
        };
        
        const createdStatus = statusService.create(newStatus);
        updatedStatuses = [...statuses, createdStatus];
        
        updateGlobalStatusConfig(createdStatus);
        toast.success(`Le statut "${status.label}" a été ajouté avec succès`);
      }
      
      onStatusesChange(updatedStatuses);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du statut:', error);
      toast.error('Une erreur est survenue lors de la sauvegarde du statut');
    }
  };
  
  // Obtenir tous les codes de statut existants sauf celui en cours d'édition
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
