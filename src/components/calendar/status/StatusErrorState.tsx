
import React from 'react';
import { RadioGroup } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { StatusCode } from '@/types';
import { StatusOption } from '../StatusOption';
import { ProjectSelector } from '../ProjectSelector';
import { HighlightOption } from '../HighlightOption';
import { AlertCircle } from 'lucide-react';

interface StatusErrorStateProps {
  selectedStatus: StatusCode;
  selectedProject: string;
  highlightedStatus: boolean;
  projects: { id: string; code: string; name: string; color: string }[];
  onStatusChange: (status: StatusCode) => void;
  onProjectChange: (projectCode: string) => void;
  onHighlightChange: (checked: boolean) => void;
  onSubmit: () => void;
}

export function StatusErrorState({
  selectedStatus,
  selectedProject,
  highlightedStatus,
  projects,
  onStatusChange,
  onProjectChange,
  onHighlightChange,
  onSubmit
}: StatusErrorStateProps) {
  // Default statuses to use when we can't load from database
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
          onValueChange={(value) => onStatusChange(value as StatusCode)}
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
          onProjectChange={onProjectChange}
        />
      )}
      
      <HighlightOption
        isHighlighted={highlightedStatus}
        onHighlightChange={onHighlightChange}
      />
      
      <Button onClick={onSubmit} className="w-full">
        Appliquer
      </Button>
    </div>
  );
}
