
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
  const [selectedStatus, setSelectedStatus] = useState<StatusCode>(initialStatus || '');
  const [highlightedStatus, setHighlightedStatus] = useState(initialIsHighlighted);
  const [selectedProject, setSelectedProject] = useState(initialProjectCode || 'no-project');
  
  console.log("StatusSelectorForm initialized with:", { 
    initialStatus, 
    initialIsHighlighted, 
    initialProjectCode,
    selectedPeriod
  });
  
  // Reset form when dialog reopens with new values
  useEffect(() => {
    setSelectedStatus(initialStatus || '');
    setHighlightedStatus(initialIsHighlighted);
    setSelectedProject(initialProjectCode || 'no-project');
    
    console.log("StatusSelectorForm state reset with:", { 
      initialStatus, 
      initialIsHighlighted, 
      initialProjectCode
    });
  }, [initialStatus, initialIsHighlighted, initialProjectCode]);
  
  const handleStatusChange = (newStatus: StatusCode) => {
    console.log("Changement de statut:", newStatus);
    setSelectedStatus(newStatus);
    
    // Réinitialiser le projet sélectionné si le statut n'est pas "projet"
    if (newStatus !== 'projet') {
      setSelectedProject('no-project');
    }
  };
  
  const handleProjectChange = (projectCode: string) => {
    console.log("Changement de projet:", projectCode);
    setSelectedProject(projectCode);
  };
  
  const handleHighlightChange = (checked: boolean) => {
    console.log("Changement de mise en évidence:", checked);
    setHighlightedStatus(checked);
  };
  
  const handleSubmit = () => {
    try {
      const projectToUse = selectedStatus === 'projet' ? selectedProject : undefined;
      console.log("Formulaire soumis avec:", { 
        selectedStatus, 
        highlightedStatus, 
        projectToUse
      });
      onSubmit(selectedStatus, highlightedStatus, projectToUse);
    } catch (error) {
      console.error("Erreur lors de la soumission du formulaire:", error);
    }
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
          selectedProject={selectedProject || "no-project"}
          onProjectChange={handleProjectChange}
        />
      )}
      
      <HighlightOption
        isHighlighted={highlightedStatus}
        onHighlightChange={handleHighlightChange}
      />
      
      <FormActions
        onSubmit={handleSubmit}
        selectedStatus={selectedStatus}
        selectedProject={selectedProject}
        selectedPeriod={selectedPeriod}
      />
    </div>
  );
}
