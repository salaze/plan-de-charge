
import { useState, useMemo } from 'react';
import { Status, StatusCode } from '@/types';
import { toast } from 'sonner';
import { statusService } from '@/services/supabaseServices';
import { generateId } from '@/utils';

export function useStatusManager(initialStatuses: Status[], onStatusesChange: (statuses: Status[]) => void) {
  const [statuses, setStatuses] = useState<Status[]>(initialStatuses);
  const [formOpen, setFormOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<Status | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusToDelete, setStatusToDelete] = useState<string | null>(null);

  // Ouvrir le formulaire pour ajouter un nouveau statut
  const handleAddStatus = () => {
    setCurrentStatus(null);
    setFormOpen(true);
  };

  // Ouvrir le formulaire pour éditer un statut existant
  const handleEditStatus = (status: Status) => {
    setCurrentStatus(status);
    setFormOpen(true);
  };

  // Ouvrir la boîte de dialogue de confirmation de suppression
  const handleDeleteStatus = (statusId: string) => {
    setStatusToDelete(statusId);
    setDeleteDialogOpen(true);
  };

  // Confirmer la suppression d'un statut
  const confirmDeleteStatus = async () => {
    if (!statusToDelete) return;

    try {
      const success = await statusService.delete(statusToDelete);
      
      if (success) {
        // Mettre à jour l'état local
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

  // Sauvegarder un statut (nouveau ou existant)
  const handleSaveStatus = async (status: Status) => {
    try {
      if (status.id) {
        // Mettre à jour un statut existant
        const updatedStatus = await statusService.update(status);
        
        if (updatedStatus) {
          const updatedStatuses = statuses.map(s => 
            s.id === status.id ? updatedStatus : s
          );
          setStatuses(updatedStatuses);
          onStatusesChange(updatedStatuses);
          toast.success('Statut mis à jour avec succès');
        } else {
          toast.error('Erreur lors de la mise à jour du statut');
        }
      } else {
        // Créer un nouveau statut
        const newStatus = await statusService.create({
          ...status,
          id: generateId()
        });
        
        if (newStatus) {
          const updatedStatuses = [...statuses, newStatus];
          setStatuses(updatedStatuses);
          onStatusesChange(updatedStatuses);
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

  // Obtenir la liste des codes de statut existants (pour validation)
  const getExistingCodes = (): string[] => {
    return statuses
      .filter(s => s.id !== currentStatus?.id)
      .map(s => s.code);
  };

  // Trier les statuts par ordre d'affichage
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
