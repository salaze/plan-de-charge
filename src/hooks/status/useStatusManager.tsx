
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Status } from '@/components/admin/status/types';
import { StatusCode, STATUS_LABELS, STATUS_COLORS } from '@/types';

interface UseStatusManagerProps {
  statuses: Status[];
  onStatusesChange: (statuses: Status[]) => void;
  isConnected: boolean;
}

export function useStatusManager({ statuses, onStatusesChange, isConnected }: UseStatusManagerProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<Status | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusToDelete, setStatusToDelete] = useState<string>('');
  
  const [code, setCode] = useState<StatusCode>('');
  const [label, setLabel] = useState('');
  const [color, setColor] = useState('bg-green-500 text-white');

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

  const handleAddStatus = () => {
    setCurrentStatus(null);
    setCode('' as StatusCode);
    setLabel('');
    setColor('bg-green-500 text-white');
    setFormOpen(true);
  };

  const handleEditStatus = (status: Status) => {
    setCurrentStatus(status);
    setCode(status.code);
    setLabel(status.label);
    setColor(status.color);
    setFormOpen(true);
  };

  const handleDeleteStatus = (statusId: string) => {
    setStatusToDelete(statusId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!statusToDelete) return;
    
    try {
      const statusToRemove = statuses.find(status => status.id === statusToDelete);
      
      if (statusToRemove) {
        if (isConnected) {
          const { error } = await supabase
            .from('statuts')
            .delete()
            .eq('id', statusToDelete);
            
          if (error) throw error;
        }
      }
      
      const updatedStatuses = statuses.filter(status => status.id !== statusToDelete);
      onStatusesChange(updatedStatuses);
      
      toast.success('Statut supprimé avec succès');

      // Mise à jour du registre global des statuts
      const event = new CustomEvent('statusesUpdated');
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Erreur lors de la suppression du statut:', error);
      toast.error('Erreur lors de la suppression du statut');
    } finally {
      setDeleteDialogOpen(false);
      setStatusToDelete('');
    }
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || !label) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    const codeExists = statuses.some(s => 
      s.code === code && s.id !== (currentStatus?.id || '')
    );
    
    if (codeExists) {
      toast.error('Ce code de statut existe déjà');
      return;
    }
    
    try {
      if (currentStatus) {
        if (isConnected) {
          const { error } = await supabase
            .from('statuts')
            .update({
              code: code,
              libelle: label,
              couleur: color
            })
            .eq('id', currentStatus.id);
            
          if (error) throw error;
        }
          
        const updatedStatuses = statuses.map(status => 
          status.id === currentStatus.id 
            ? { ...status, code, label, color } 
            : status
        );
        onStatusesChange(updatedStatuses);
        
        toast.success('Statut modifié avec succès');
      } else {
        const newStatus: Status = {
          id: crypto.randomUUID(),
          code,
          label,
          color
        };
        
        if (isConnected) {
          const { error } = await supabase
            .from('statuts')
            .insert({
              id: newStatus.id,
              code: code,
              libelle: label,
              couleur: color,
              display_order: 0
            });
            
          if (error) throw error;
        }
        
        const updatedStatuses = [...statuses, newStatus];
        onStatusesChange(updatedStatuses);
        
        toast.success('Statut ajouté avec succès');
      }
      
      // Ensure STATUS_LABELS and STATUS_COLORS are updated
      STATUS_LABELS[code] = label;
      STATUS_COLORS[code] = color;
      
      // Trigger a global event to notify other components about status changes
      const event = new CustomEvent('statusesUpdated');
      window.dispatchEvent(event);
      
      setFormOpen(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du statut:', error);
      toast.error('Erreur lors de la sauvegarde du statut');
    }
  };

  return {
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
  };
}
