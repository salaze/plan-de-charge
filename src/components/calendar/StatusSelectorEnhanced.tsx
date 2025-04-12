
import React, { useState, useEffect } from 'react';
import { RadioGroup } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { StatusCode, DayPeriod } from '@/types';
import { useStatusOptions } from '@/hooks/useStatusOptions';
import { StatusOption } from './StatusOption';
import { ProjectSelector } from './ProjectSelector';
import { HighlightOption } from './HighlightOption';
import { toast } from 'sonner';

interface StatusSelectorEnhancedProps {
  value: StatusCode;
  onChange: (status: StatusCode, isHighlighted?: boolean, projectCode?: string) => void;
  projects: { id: string; code: string; name: string; color: string }[];
  isHighlighted?: boolean;
  projectCode?: string;
  selectedPeriod?: DayPeriod;
}

export function StatusSelectorEnhanced({ 
  value, 
  onChange, 
  projects, 
  isHighlighted = false,
  projectCode = '',
  selectedPeriod = 'AM'
}: StatusSelectorEnhancedProps) {
  const [highlightedStatus, setHighlightedStatus] = useState(isHighlighted);
  const [selectedProject, setSelectedProject] = useState(projectCode || 'no-project');
  const [selectedStatus, setSelectedStatus] = useState<StatusCode>(value || 'none');
  
  // Use our custom hook to get available statuses
  const { availableStatuses, loading } = useStatusOptions();
  
  console.log("StatusSelectorEnhanced: Statut initial:", value, "Projet initial:", projectCode, "Statuts disponibles:", availableStatuses);
  
  // Reset form when dialog reopens with new values
  useEffect(() => {
    setSelectedStatus(value || 'none');
    setHighlightedStatus(isHighlighted);
    setSelectedProject(projectCode || 'no-project');
  }, [value, isHighlighted, projectCode]);
  
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
    if (selectedStatus === 'projet' && (!selectedProject || selectedProject === 'no-project')) {
      toast.error("Veuillez sélectionner un projet");
      return;
    }
    
    console.log("Soumission du formulaire:", {
      status: selectedStatus,
      highlighted: highlightedStatus,
      project: selectedStatus === 'projet' ? selectedProject : undefined
    });
    
    const projectToUse = selectedStatus === 'projet' ? selectedProject : undefined;
    onChange(selectedStatus, highlightedStatus, projectToUse);
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-base">Sélectionner un statut</Label>
        <RadioGroup 
          value={selectedStatus} 
          onValueChange={(value) => handleStatusChange(value as StatusCode)}
          className="grid grid-cols-2 gap-2"
        >
          {loading ? (
            <div>Chargement des statuts...</div>
          ) : (
            availableStatuses.map((status) => (
              <StatusOption 
                key={status.value} 
                value={status.value} 
                label={status.label} 
              />
            ))
          )}
        </RadioGroup>
      </div>
      
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
      
      <Button onClick={handleSubmit} className="w-full">
        Appliquer
      </Button>
    </div>
  );
}
