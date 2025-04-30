
import { useState, useEffect } from 'react';
import { StatusCode } from '@/types';
import { toast } from 'sonner';

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
  
  // Reset form when new initial values are provided
  useEffect(() => {
    setSelectedStatus(initialStatus || 'none');
    setHighlightedStatus(initialHighlighted);
    setSelectedProject(initialProjectCode || 'no-project');
  }, [initialStatus, initialHighlighted, initialProjectCode]);
  
  const handleStatusChange = (newStatus: StatusCode) => {
    setSelectedStatus(newStatus);
    
    // Reset project selection if the status is not "projet"
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
    
    // Notify that we're still in edit mode to prevent automatic refreshes
    console.log("Début de l'application du statut, mode édition maintenu");
    window.dispatchEvent(new CustomEvent('statusEditStart'));
    
    const projectToUse = selectedStatus === 'projet' ? selectedProject : undefined;
    
    if (onComplete) {
      onComplete(selectedStatus, highlightedStatus, projectToUse);
    }
  };
  
  return {
    selectedStatus,
    highlightedStatus,
    selectedProject,
    handleStatusChange,
    handleProjectChange,
    handleHighlightChange,
    handleSubmit
  };
}
