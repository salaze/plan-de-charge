
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
import { AlertCircle, Loader2 } from 'lucide-react';

interface StatusSelectorEnhancedProps {
  value: StatusCode;
  onChange: (status: StatusCode, isHighlighted?: boolean, projectCode?: string) => void;
  projects: { id: string; code: string; name: string; color: string }[];
  isHighlighted?: boolean;
  projectCode?: string;
  selectedPeriod: 'AM' | 'PM';
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
  const [loadingError, setLoadingError] = useState<string | null>(null);
  
  // Use our custom hook to get available statuses
  const { availableStatuses, isLoading } = useStatusOptions();
  
  // Reset form when dialog reopens with new values
  useEffect(() => {
    setSelectedStatus(value || 'none');
    setHighlightedStatus(isHighlighted);
    setSelectedProject(projectCode || 'no-project');
  }, [value, isHighlighted, projectCode]);
  
  // Vérifier si les statuts sont disponibles
  useEffect(() => {
    if (!isLoading && (!availableStatuses || availableStatuses.length === 0)) {
      setLoadingError("Impossible de charger les statuts disponibles");
      console.error("Aucun statut disponible après chargement");
    } else if (availableStatuses && availableStatuses.length > 0) {
      setLoadingError(null);
    }
  }, [availableStatuses, isLoading]);
  
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
    
    // Petit délai avant de notifier la fin de l'édition (sera géré par onClose du dialogue)
    setTimeout(() => {
      toast.success(`Statut ${selectedPeriod === 'AM' ? 'matin' : 'après-midi'} enregistré avec succès`);
    }, 500);
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Chargement des statuts...</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
        <Skeleton className="h-10 w-full mt-4" />
      </div>
    );
  }
  
  if (loadingError || !availableStatuses || availableStatuses.length === 0) {
    const defaultStatuses = [
      { value: 'none' as StatusCode, label: 'Aucun' },
      { value: 'assistance' as StatusCode, label: 'Assistance' },
      { value: 'vigi' as StatusCode, label: 'Vigi' },
      { value: 'conges' as StatusCode, label: 'Congés' },
      { value: 'projet' as StatusCode, label: 'Projet' }
    ];
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-amber-600 mb-4">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">Utilisation des statuts par défaut (impossible de charger depuis la base)</span>
        </div>
        <div className="space-y-3">
          <Label className="text-base">Sélectionner un statut</Label>
          <RadioGroup 
            value={selectedStatus} 
            onValueChange={(value) => handleStatusChange(value as StatusCode)}
            className="grid grid-cols-2 gap-2"
          >
            {defaultStatuses.map((status) => (
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
