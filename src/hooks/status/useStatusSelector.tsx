
import { useState, useEffect } from 'react';
import { StatusCode } from '@/types';
import { toast } from 'sonner';
import { checkProjectExists } from '@/utils/supabase/schedule';

interface UseStatusSelectorProps {
  initialStatus: StatusCode;
  initialHighlighted?: boolean;
  initialProjectCode?: string;
  onComplete?: (status: StatusCode, isHighlighted?: boolean, projectCode?: string) => void;
}

export function useStatusSelector({
  initialStatus,
  initialHighlighted = false,
  initialProjectCode = '',
  onComplete
}: UseStatusSelectorProps) {
  const [selectedStatus, setSelectedStatus] = useState<StatusCode>(initialStatus || 'none');
  const [highlightedStatus, setHighlightedStatus] = useState(initialHighlighted);
  const [selectedProject, setSelectedProject] = useState(initialProjectCode || 'no-project');
  const [isValidating, setIsValidating] = useState(false);
  
  // Reset form when new initial values are provided
  useEffect(() => {
    setSelectedStatus(initialStatus || 'none');
    setHighlightedStatus(initialHighlighted);
    setSelectedProject(initialProjectCode || 'no-project');
    
    // Log pour débogage
    if (initialProjectCode) {
      console.log(`useStatusSelector: initialProjectCode défini sur ${initialProjectCode}`);
    }
  }, [initialStatus, initialHighlighted, initialProjectCode]);
  
  const handleStatusChange = (newStatus: StatusCode) => {
    setSelectedStatus(newStatus);
    
    // Reset project selection if the status is not "projet"
    if (newStatus !== 'projet') {
      setSelectedProject('no-project');
    }
    
    console.log(`Statut sélectionné: ${newStatus}`);
  };
  
  const handleProjectChange = (projectCode: string) => {
    setSelectedProject(projectCode);
    console.log(`Projet sélectionné: ${projectCode}`);
  };
  
  const handleHighlightChange = (checked: boolean) => {
    setHighlightedStatus(checked);
    console.log(`Mise en évidence: ${checked}`);
  };
  
  const handleSubmit = async () => {
    setIsValidating(true);
    
    try {
      if (selectedStatus === 'projet' && (!selectedProject || selectedProject === 'no-project')) {
        toast.error("Veuillez sélectionner un projet");
        return;
      }
      
      // Si le statut est "projet", vérifier que le projet existe dans la base de données
      if (selectedStatus === 'projet' && selectedProject !== 'no-project') {
        const projectExists = await checkProjectExists(selectedProject);
        if (!projectExists) {
          toast.error(`Le projet avec le code ${selectedProject} n'existe pas dans la base de données`);
          return;
        }
      }
      
      // Notify that we're still in edit mode to prevent automatic refreshes
      console.log("Début de l'application du statut, mode édition maintenu");
      window.dispatchEvent(new CustomEvent('statusEditStart'));
      
      const projectToUse = selectedStatus === 'projet' ? selectedProject : undefined;
      
      if (onComplete) {
        console.log(`Appel de onComplete avec statut=${selectedStatus}, highlight=${highlightedStatus}, projet=${projectToUse}`);
        onComplete(selectedStatus, highlightedStatus, projectToUse);
      }
    } catch (error) {
      console.error('Erreur lors de la soumission du statut:', error);
      toast.error('Une erreur est survenue lors de la validation du statut');
    } finally {
      setIsValidating(false);
    }
  };
  
  return {
    selectedStatus,
    highlightedStatus,
    selectedProject,
    isValidating,
    handleStatusChange,
    handleProjectChange,
    handleHighlightChange,
    handleSubmit
  };
}
