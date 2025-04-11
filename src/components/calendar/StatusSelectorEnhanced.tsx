
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
  const [selectedProject, setSelectedProject] = useState(projectCode);
  const [selectedStatus, setSelectedStatus] = useState<StatusCode>(value || 'none');
  
  // Use our custom hook to get available statuses
  const availableStatuses = useStatusOptions();
  
  // Reset form when dialog reopens with new values
  useEffect(() => {
    setSelectedStatus(value || 'none');
    setHighlightedStatus(isHighlighted);
    setSelectedProject(projectCode || '');
  }, [value, isHighlighted, projectCode]);
  
  const handleStatusChange = (newStatus: StatusCode) => {
    setSelectedStatus(newStatus);
    
    // Réinitialiser le projet sélectionné si le statut n'est pas "projet"
    if (newStatus !== 'projet') {
      setSelectedProject('');
    }
  };
  
  const handleProjectChange = (projectCode: string) => {
    setSelectedProject(projectCode);
  };
  
  const handleHighlightChange = (checked: boolean) => {
    setHighlightedStatus(checked);
  };
  
  const handleSubmit = () => {
    if (selectedStatus === 'projet' && !selectedProject) {
      toast.error("Veuillez sélectionner un projet");
      return;
    }
    
    const projectToUse = selectedStatus === 'projet' ? selectedProject : undefined;
    const finalStatus = selectedStatus === 'none' ? 'none' : selectedStatus;
    onChange(finalStatus, highlightedStatus, projectToUse);
    
    toast.success(`Statut ${selectedPeriod === 'AM' ? 'matin' : 'après-midi'} enregistré avec succès`);
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
          {availableStatuses.map((status) => (
            <StatusOption 
              key={status.value} 
              value={status.value} 
              label={status.label} 
            />
          ))}
        </RadioGroup>
      </div>
      
      {selectedStatus === 'projet' && (
        <ProjectSelector
          projects={projects}
          selectedProject={selectedProject}
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
