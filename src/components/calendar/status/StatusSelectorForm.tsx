
import React, { useState, useEffect } from 'react';
import { StatusCode, DayPeriod } from '@/types';
import { StatusOptionsList } from './StatusOptionsList';
import { ProjectSelector } from '../ProjectSelector';
import { HighlightOption } from '../HighlightOption';
import { FormActions } from './FormActions';

interface StatusSelectorFormProps {
  initialStatus: StatusCode;
  initialIsHighlighted: boolean;
  initialProjectCode: string;
  selectedPeriod: DayPeriod;
  projects: { id: string; code: string; name: string; color: string }[];
  onSubmit: (status: StatusCode, isHighlighted: boolean, projectCode?: string) => void;
}

export function StatusSelectorForm({
  initialStatus,
  initialIsHighlighted,
  initialProjectCode,
  selectedPeriod,
  projects,
  onSubmit
}: StatusSelectorFormProps) {
  const [selectedStatus, setSelectedStatus] = useState<StatusCode>(initialStatus || 'none');
  const [highlightedStatus, setHighlightedStatus] = useState(initialIsHighlighted);
  const [selectedProject, setSelectedProject] = useState(initialProjectCode || 'no-project');
  
  // Reset form when dialog reopens with new values
  useEffect(() => {
    setSelectedStatus(initialStatus || 'none');
    setHighlightedStatus(initialIsHighlighted);
    setSelectedProject(initialProjectCode || 'no-project');
  }, [initialStatus, initialIsHighlighted, initialProjectCode]);
  
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
  
  const handleFormSubmit = () => {
    const projectToUse = selectedStatus === 'projet' ? selectedProject : undefined;
    onSubmit(selectedStatus, highlightedStatus, projectToUse);
  };

  return (
    <div className="space-y-6">
      <StatusOptionsList
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
      />
      
      {selectedStatus === 'projet' && (
        <ProjectSelector
          projects={projects}
          selectedProject={selectedProject || "select-project"}
          onProjectChange={handleProjectChange}
        />
      )}
      
      <HighlightOption
        isHighlighted={highlightedStatus}
        onHighlightChange={handleHighlightChange}
      />
      
      <FormActions
        onSubmit={handleFormSubmit}
        selectedStatus={selectedStatus}
        selectedProject={selectedProject}
        selectedPeriod={selectedPeriod}
      />
    </div>
  );
}
