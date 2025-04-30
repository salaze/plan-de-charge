
import React from 'react';
import { RadioGroup } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { StatusCode } from '@/types';
import { StatusOption } from '../StatusOption';
import { ProjectSelector } from '../ProjectSelector';
import { HighlightOption } from '../HighlightOption';
import { Loader2 } from 'lucide-react';

interface StatusOptionsListProps {
  statuses: StatusCode[];
  selectedStatus: StatusCode;
  selectedProject: string;
  highlightedStatus: boolean;
  projects: { id: string; code: string; name: string; color: string }[];
  onStatusChange: (status: StatusCode) => void;
  onProjectChange: (projectCode: string) => void;
  onHighlightChange: (checked: boolean) => void;
  onSubmit: () => void;
  isValidating?: boolean;
}

export function StatusOptionsList({
  statuses,
  selectedStatus,
  selectedProject,
  highlightedStatus,
  projects,
  onStatusChange,
  onProjectChange,
  onHighlightChange,
  onSubmit,
  isValidating = false
}: StatusOptionsListProps) {
  // Vérifier si des projets sont disponibles
  const hasProjects = projects && projects.length > 0;
  
  // Déterminer si le bouton doit être désactivé
  const isSubmitDisabled = 
    isValidating || 
    (selectedStatus === 'projet' && (!selectedProject || selectedProject === 'no-project' || !hasProjects));

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-base">Sélectionner un statut</Label>
        <RadioGroup 
          value={selectedStatus} 
          onValueChange={(value) => onStatusChange(value as StatusCode)}
          className="grid grid-cols-2 gap-2"
        >
          {statuses.map((status) => (
            <StatusOption 
              key={status} 
              value={status} 
              label={status} 
            />
          ))}
        </RadioGroup>
      </div>
      
      {selectedStatus === 'projet' && (
        <div className="space-y-2">
          <ProjectSelector
            projects={projects}
            selectedProject={selectedProject || "select-project"}
            onProjectChange={onProjectChange}
          />
          
          {!hasProjects && (
            <div className="text-xs text-amber-500">
              Aucun projet disponible. Veuillez en créer un dans l'administration.
            </div>
          )}
        </div>
      )}
      
      <HighlightOption
        isHighlighted={highlightedStatus}
        onHighlightChange={onHighlightChange}
      />
      
      <Button 
        onClick={onSubmit} 
        className="w-full"
        disabled={isSubmitDisabled}
      >
        {isValidating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Validation...
          </>
        ) : (
          'Appliquer'
        )}
      </Button>
    </div>
  );
}
