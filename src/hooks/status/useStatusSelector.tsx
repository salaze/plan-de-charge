
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
  const [projectValidated, setProjectValidated] = useState(false);
  
  // Reset form when new initial values are provided
  useEffect(() => {
    setSelectedStatus(initialStatus || 'none');
    setHighlightedStatus(initialHighlighted);
    
    if (initialProjectCode) {
      console.log(`useStatusSelector: initialProjectCode défini sur ${initialProjectCode}`);
      setSelectedProject(initialProjectCode);
      setProjectValidated(true); // Si un code de projet est fourni initialement, on suppose qu'il a déjà été validé
    } else {
      setSelectedProject('no-project');
      setProjectValidated(false);
    }
  }, [initialStatus, initialHighlighted, initialProjectCode]);
  
  const handleStatusChange = (newStatus: StatusCode) => {
    setSelectedStatus(newStatus);
    
    // Reset project selection if the status is not "projet"
    if (newStatus !== 'projet') {
      setSelectedProject('no-project');
      setProjectValidated(false);
    }
    
    console.log(`Statut sélectionné: ${newStatus}`);
  };
  
  const handleProjectChange = (projectCode: string) => {
    if (!projectCode || projectCode === 'select-project') {
      setSelectedProject('no-project');
      setProjectValidated(false);
      return;
    }
    
    setSelectedProject(projectCode);
    console.log(`Projet sélectionné: ${projectCode}`);
    
    // Vérifier immédiatement si le projet existe
    if (selectedStatus === 'projet') {
      setIsValidating(true);
      checkProjectExists(projectCode)
        .then(exists => {
          setProjectValidated(exists);
          setIsValidating(false);
          if (!exists) {
            toast.error(`Le projet avec le code ${projectCode} n'existe pas dans la base de données`);
          } else {
            console.log(`Projet ${projectCode} validé avec succès`);
          }
        })
        .catch(err => {
          console.error("Erreur lors de la vérification du projet:", err);
          setProjectValidated(false);
          setIsValidating(false);
        });
    }
  };
  
  const handleHighlightChange = (checked: boolean) => {
    setHighlightedStatus(checked);
    console.log(`Mise en évidence: ${checked}`);
  };
  
  const handleSubmit = async () => {
    setIsValidating(true);
    
    try {
      if (selectedStatus === 'projet' && (!selectedProject || selectedProject === 'no-project' || selectedProject === 'select-project')) {
        toast.error("Veuillez sélectionner un projet");
        setIsValidating(false);
        return;
      }
      
      // Si le statut est "projet", vérifier que le projet existe dans la base de données
      if (selectedStatus === 'projet' && !projectValidated) {
        console.log("Vérification de l'existence du projet avant la sauvegarde...");
        const projectExists = await checkProjectExists(selectedProject);
        if (!projectExists) {
          toast.error(`Le projet avec le code ${selectedProject} n'existe pas dans la base de données`);
          setIsValidating(false);
          return;
        }
        setProjectValidated(true);
        console.log(`Projet ${selectedProject} validé avec succès`);
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
    projectValidated,
    handleStatusChange,
    handleProjectChange,
    handleHighlightChange,
    handleSubmit
  };
}
