
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Status } from '@/components/admin/status/types';
import { StatusCode, STATUS_LABELS, STATUS_COLORS } from '@/types';

interface UseStatusOperationsProps {
  statuses: Status[];
  onStatusesChange: (statuses: Status[]) => void;
  isConnected: boolean;
}

export function useStatusOperations({ 
  statuses, 
  onStatusesChange, 
  isConnected 
}: UseStatusOperationsProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveStatus = async (
    e: React.FormEvent,
    { 
      currentStatus, 
      code, 
      label, 
      color 
    }: { 
      currentStatus: Status | null;
      code: StatusCode;
      label: string;
      color: string;
    }
  ) => {
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
      setIsSaving(true);
      
      if (currentStatus) {
        // Mise à jour d'un statut existant
        if (isConnected) {
          const { error } = await supabase
            .from('statuts')
            .update({
              code,
              libelle: label,
              couleur: color
            })
            .eq('id', currentStatus.id);
            
          if (error) {
            console.error('Erreur Supabase lors de la mise à jour:', error);
            throw error;
          }
          
          console.log('Statut mis à jour dans Supabase avec succès');
        }
        
        const updatedStatuses = statuses.map(status => 
          status.id === currentStatus.id 
            ? { ...status, code, label, color } 
            : status
        );
        onStatusesChange(updatedStatuses);
        
        toast.success('Statut modifié avec succès');
      } else {
        // Création d'un nouveau statut
        const newStatusId = crypto.randomUUID();
        const newStatus: Status = {
          id: newStatusId,
          code,
          label,
          color
        };
        
        if (isConnected) {
          // Déterminer l'ordre d'affichage maximal actuel
          let maxDisplayOrder = 0;
          const { data: existingStatuses } = await supabase
            .from('statuts')
            .select('display_order')
            .order('display_order', { ascending: false })
            .limit(1);
            
          if (existingStatuses && existingStatuses.length > 0) {
            maxDisplayOrder = existingStatuses[0].display_order || 0;
          }
          
          const { error } = await supabase
            .from('statuts')
            .insert({
              id: newStatusId,
              code,
              libelle: label,
              couleur: color,
              display_order: maxDisplayOrder + 10 // Incrémenter par 10
            });
            
          if (error) {
            console.error('Erreur Supabase lors de la création:', error);
            throw error;
          }
          
          console.log('Nouveau statut créé dans Supabase avec succès');
        }
        
        const updatedStatuses = [...statuses, newStatus];
        onStatusesChange(updatedStatuses);
        
        toast.success('Statut ajouté avec succès');
      }
      
      // Mettre à jour STATUS_LABELS et STATUS_COLORS
      STATUS_LABELS[code] = label;
      STATUS_COLORS[code] = color;
      
      // Déclencher un événement global pour notifier les autres composants
      const event = new CustomEvent('statusesUpdated');
      window.dispatchEvent(event);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du statut:', error);
      toast.error('Erreur lors de la sauvegarde du statut');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async (statusToDelete: string) => {
    if (!statusToDelete) return;
    
    try {
      setIsSaving(true);
      const statusToRemove = statuses.find(status => status.id === statusToDelete);
      
      if (statusToRemove) {
        if (isConnected) {
          const { error } = await supabase
            .from('statuts')
            .delete()
            .eq('id', statusToDelete);
            
          if (error) {
            console.error('Erreur Supabase lors de la suppression:', error);
            throw error;
          }
          
          console.log('Statut supprimé dans Supabase avec succès');
        }
      }
      
      const updatedStatuses = statuses.filter(status => status.id !== statusToDelete);
      onStatusesChange(updatedStatuses);
      
      toast.success('Statut supprimé avec succès');

      // Mise à jour du registre global des statuts
      const event = new CustomEvent('statusesUpdated');
      window.dispatchEvent(event);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du statut:', error);
      toast.error('Erreur lors de la suppression du statut');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    handleSaveStatus,
    handleConfirmDelete
  };
}
