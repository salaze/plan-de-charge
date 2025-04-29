
import { useState, useEffect } from 'react';
import { StatusCode } from '@/types';
import { toast } from 'sonner';

interface UseStatusSelectorProps {
  value: StatusCode;
  onChange: (status: StatusCode, isHighlighted?: boolean, projectCode?: string) => void;
  isHighlighted?: boolean;
  projectCode?: string;
  statuses: StatusCode[] | string[];
  isLoading: boolean;
}

export function useStatusSelector({
  value,
  onChange,
  isHighlighted = false,
  projectCode = '',
  statuses,
  isLoading
}: UseStatusSelectorProps) {
  const [highlightedStatus, setHighlightedStatus] = useState(isHighlighted);
  const [selectedProject, setSelectedProject] = useState(projectCode || 'no-project');
  const [selectedStatus, setSelectedStatus] = useState<StatusCode>(value || 'none');
  
  // Reset form when dialog reopens with new values
  useEffect(() => {
    setSelectedStatus(value || 'none');
    setHighlightedStatus(isHighlighted);
    setSelectedProject(projectCode || 'no-project');
  }, [value, isHighlighted, projectCode]);
  
  const handleStatusChange = (newStatus: StatusCode) => {
    setSelectedStatus(newStatus);
    
    // Réinitialiser le projet sélectionné si le statut n'est pas "projet"
    if (newStatus !== 'projet') {
      setSelectedProject('no-project');
    }
  };
  
  const handleProjectChange = (projectCode: string) => {
    setSelectedProject(projectCode);
  };
  
  const handleHighlightChange = (checked: boolean) => {
    setHighlightedStatus(checked);
  };
  
  const handleSubmit = () => {
    if (selectedStatus === 'projet' && (!selectedProject || selectedProject === 'no-project')) {
      toast.error("Veuillez sélectionner un projet");
      return;
    }
    
    // Signaler que nous sommes toujours en mode édition pour éviter les actualisations automatiques
    console.log("Début de l'application du statut, mode édition maintenu");
    window.dispatchEvent(new CustomEvent('statusEditStart'));
    
    const projectToUse = selectedStatus === 'projet' ? selectedProject : undefined;
    onChange(selectedStatus, highlightedStatus, projectToUse);
  };
  
  return {
    selectedStatus,
    highlightedStatus,
    selectedProject,
    handleStatusChange,
    handleProjectChange,
    handleHighlightChange,
    handleSubmit,
  };
}
