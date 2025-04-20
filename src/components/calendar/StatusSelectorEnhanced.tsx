
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
import { Skeleton } from '@/components/ui/skeleton';

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
  const { availableStatuses, isLoading } = useStatusOptions();
  
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
    
    const projectToUse = selectedStatus === 'projet' ? selectedProject : undefined;
    onChange(selectedStatus, highlightedStatus, projectToUse);
    
    toast.success(`Statut ${selectedPeriod === 'AM' ? 'matin' : 'après-midi'} enregistré avec succès`);
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32 mb-3" />
        <div className="grid grid-cols-2 gap-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
        <Skeleton className="h-10 w-full mt-4" />
      </div>
    );
  }
  
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
