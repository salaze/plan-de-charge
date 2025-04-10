
import React, { useState, useEffect } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusCode, STATUS_LABELS, STATUS_COLORS } from '@/types';
import { Button } from '@/components/ui/button';

interface StatusSelectorEnhancedProps {
  value: StatusCode;
  onChange: (status: StatusCode, isHighlighted?: boolean, projectCode?: string) => void;
  projects: { id: string; code: string; name: string; color: string }[];
  isHighlighted?: boolean;
  projectCode?: string;
}

export function StatusSelectorEnhanced({ 
  value, 
  onChange, 
  projects, 
  isHighlighted = false,
  projectCode = ''
}: StatusSelectorEnhancedProps) {
  const [highlightedStatus, setHighlightedStatus] = useState(isHighlighted);
  const [selectedProject, setSelectedProject] = useState(projectCode);
  const [selectedStatus, setSelectedStatus] = useState<StatusCode>(value);
  const [availableStatuses, setAvailableStatuses] = useState<{ value: StatusCode; label: string }[]>([]);
  
  // Charger les statuts disponibles immédiatement et réagir aux changements
  useEffect(() => {
    const loadStatuses = () => {
      const savedData = localStorage.getItem('planningData');
      const data = savedData ? JSON.parse(savedData) : { statuses: [] };
      
      // Si nous avons des statuts personnalisés, les utiliser
      if (data.statuses && data.statuses.length > 0) {
        setAvailableStatuses([
          { value: '', label: 'Aucun' },
          ...data.statuses.map((status: any) => ({
            value: status.code as StatusCode,
            label: status.label
          }))
        ]);
      } else {
        // Sinon, utiliser les statuts par défaut
        setAvailableStatuses([
          { value: '', label: 'Aucun' },
          { value: 'assistance', label: 'Assistance' },
          { value: 'vigi', label: 'Vigi' },
          { value: 'formation', label: 'Formation' },
          { value: 'projet', label: 'Projet' },
          { value: 'conges', label: 'Congés' },
          { value: 'management', label: 'Management' },
          { value: 'tp', label: 'Temps Partiel' },
          { value: 'coordinateur', label: 'Coordinateur Vigi Ticket' },
          { value: 'absence', label: 'Autre Absence' },
          { value: 'regisseur', label: 'Régisseur' },
          { value: 'demenagement', label: 'Déménagements' },
        ]);
      }
    };
    
    // Charger les statuts immédiatement
    loadStatuses();
    
    // Écouter les changements dans le localStorage
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'planningData') {
        loadStatuses();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  const handleStatusChange = (newStatus: StatusCode) => {
    setSelectedStatus(newStatus);
    
    // Réinitialiser le projet sélectionné si le statut n'est pas "projet"
    if (newStatus !== 'projet') {
      setSelectedProject('');
    }
    
    // Appliquer immédiatement si ce n'est pas un projet
    if (newStatus !== 'projet') {
      onChange(newStatus, highlightedStatus);
    }
  };
  
  const handleProjectChange = (projectCode: string) => {
    setSelectedProject(projectCode);
    
    // Appliquer immédiatement le changement de projet
    onChange(selectedStatus, highlightedStatus, projectCode);
  };
  
  const handleHighlightChange = (checked: boolean) => {
    setHighlightedStatus(checked);
    
    // Appliquer immédiatement la mise en évidence
    onChange(selectedStatus, checked, selectedProject);
  };
  
  const handleSubmit = () => {
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
          {availableStatuses.map((status) => (
            <div 
              key={status.value} 
              className="flex items-center space-x-2 rounded-md border p-2 hover:bg-secondary/50 transition-colors"
            >
              <RadioGroupItem value={status.value} id={`status-${status.value}`} />
              <Label htmlFor={`status-${status.value}`} className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  {status.value && STATUS_COLORS[status.value] && (
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ 
                        backgroundColor: status.value ? STATUS_COLORS[status.value].split(' ')[0].replace('bg-', '') : 'transparent',
                      }}
                    />
                  )}
                  {status.label}
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      
      {selectedStatus === 'projet' && (
        <div className="space-y-3">
          <Label>Sélectionner un projet</Label>
          <Select 
            value={selectedProject} 
            onValueChange={handleProjectChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir un projet" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.code}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: project.color }}
                    />
                    {project.code} - {project.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="highlight" 
          checked={highlightedStatus}
          onCheckedChange={(checked) => handleHighlightChange(checked === true)}
        />
        <Label htmlFor="highlight" className="cursor-pointer">
          Entourer de noir (mettre en évidence)
        </Label>
      </div>
      
      {selectedStatus === 'projet' && !selectedProject && (
        <Button onClick={handleSubmit} className="w-full">
          Appliquer
        </Button>
      )}
    </div>
  );
}
