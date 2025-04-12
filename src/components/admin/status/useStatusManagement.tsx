
import { useState } from 'react';
import { toast } from 'sonner';
import { StatusCode, STATUS_LABELS, STATUS_COLORS } from '@/types';
import { useSupabaseStatuses } from '@/hooks/useSupabaseStatuses';
import { generateId, ensureValidUuid } from '@/utils/idUtils';
import { useSupabaseSchedule } from '@/hooks/useSupabaseSchedule';

interface Status {
  id: string;
  code: StatusCode;
  label: string;
  color: string;
}

export function useStatusManagement(
  statuses: Status[],
  onStatusesChange: (statuses: Status[]) => void
) {
  const [formOpen, setFormOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<Status | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusToDelete, setStatusToDelete] = useState<string>('');
  
  const [code, setCode] = useState<StatusCode>('' as StatusCode);
  const [label, setLabel] = useState('');
  const [color, setColor] = useState('bg-green-500 text-white');

  const { addStatus, updateStatus, deleteStatus } = useSupabaseStatuses();
  const { saveStatus } = useSupabaseSchedule();  // Utilisation du nouveau hook
  
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
  
  const confirmDeleteStatus = async () => {
    if (!statusToDelete) return;
    
    try {
      await deleteStatus(statusToDelete);
      
      const updatedStatuses = statuses.filter(status => status.id !== statusToDelete);
      onStatusesChange(updatedStatuses);
      
      toast.success('Statut supprimé avec succès');
      setDeleteDialogOpen(false);
      setStatusToDelete('');
    } catch (error) {
      console.error("Erreur lors de la suppression du statut:", error);
      toast.error("Impossible de supprimer le statut dans Supabase");
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
      let updatedStatuses: Status[];
      
      if (currentStatus) {
        const validId = ensureValidUuid(currentStatus.id);
        
        // Essayer d'abord avec addStatus, puis avec saveStatus si addStatus échoue
        try {
          await updateStatus(validId, {
            code,
            libelle: label,
            couleur: color
          });
        } catch (error) {
          console.warn("Erreur lors de la mise à jour avec updateStatus, tentative avec saveStatus:", error);
          await saveStatus({
            code,
            libelle: label,
            couleur: color,
            display_order: statuses.findIndex(s => s.id === currentStatus.id) + 1
          });
        }
        
        updatedStatuses = statuses.map(status => 
          status.id === currentStatus.id 
            ? { ...status, id: validId, code, label, color } 
            : status
        );
        toast.success('Statut modifié avec succès');
      } else {
        const newId = generateId();
        
        // Essayer d'abord avec addStatus, puis avec saveStatus si addStatus échoue
        let result;
        try {
          result = await addStatus({
            id: newId,
            code,
            libelle: label,
            couleur: color,
            display_order: statuses.length + 1
          });
        } catch (error) {
          console.warn("Erreur lors de l'ajout avec addStatus, tentative avec saveStatus:", error);
          result = await saveStatus({
            code,
            libelle: label,
            couleur: color,
            display_order: statuses.length + 1
          });
        }
        
        const newStatus: Status = {
          id: result?.id || newId,
          code,
          label,
          color
        };
        updatedStatuses = [...statuses, newStatus];
        
        STATUS_LABELS[code] = label;
        STATUS_COLORS[code] = color;
        
        toast.success('Statut ajouté avec succès');
      }
      
      onStatusesChange(updatedStatuses);
      
      const event = new CustomEvent('statusesUpdated');
      window.dispatchEvent(event);
      
      setFormOpen(false);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du statut:", error);
      toast.error("Impossible d'enregistrer le statut dans Supabase");
    }
  };
  
  const colorOptions = [
    { value: 'bg-green-500 text-white', label: 'Vert' },
    { value: 'bg-blue-500 text-white', label: 'Bleu' },
    { value: 'bg-red-500 text-white', label: 'Rouge' },
    { value: 'bg-yellow-500 text-black', label: 'Jaune' },
    { value: 'bg-purple-500 text-white', label: 'Violet' },
    { value: 'bg-pink-500 text-white', label: 'Rose' },
    { value: 'bg-orange-500 text-white', label: 'Orange' },
    { value: 'bg-teal-500 text-white', label: 'Turquoise' },
    { value: 'bg-gray-500 text-white', label: 'Gris' },
  ];
  
  return {
    formOpen,
    setFormOpen,
    currentStatus,
    code,
    setCode,
    label,
    setLabel,
    color,
    setColor,
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleAddStatus,
    handleEditStatus,
    handleDeleteStatus,
    confirmDeleteStatus,
    handleSaveStatus,
    colorOptions
  };
}

export default useStatusManagement;
