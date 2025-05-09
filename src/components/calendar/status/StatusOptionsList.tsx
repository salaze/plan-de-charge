
import React, { useEffect } from 'react';
import { RadioGroup } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { StatusCode, STATUS_LABELS } from '@/types';
import { StatusOption } from '../StatusOption';
import { ProjectSelector } from '../ProjectSelector';
import { HighlightOption } from '../HighlightOption';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useStatusOptions } from '@/hooks/useStatusOptions';

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
  const { refreshStatuses } = useStatusOptions();
  // Ajout d'un état local pour suivre l'état du rafraîchissement
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  
  // Vérifier si des projets sont disponibles
  const hasProjects = projects && projects.length > 0;
  
  // Déterminer si le bouton doit être désactivé
  const isSubmitDisabled = 
    isValidating || 
    (selectedStatus === 'projet' && (!selectedProject || selectedProject === 'no-project' || !hasProjects));

  // Fonction pour rafraîchir les statuts
  const handleRefreshStatuses = () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    toast.info("Rafraîchissement des statuts en cours...");
    
    refreshStatuses();
    
    // Réactiver le bouton après un délai
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  // Vérifier la sélection du projet à chaque rendu ou changement de statut
  useEffect(() => {
    if (selectedStatus === 'projet') {
      console.log('StatusOptionsList: Statut de projet sélectionné', { 
        selectedProject, 
        projectsAvailable: projects.length
      });
      
      // Si aucun projet n'est sélectionné et qu'il y a des projets disponibles, sélectionner le premier projet
      if ((!selectedProject || selectedProject === 'no-project' || selectedProject === 'select-project') && hasProjects) {
        console.log('Aucun projet sélectionné mais des projets sont disponibles. Sélection du premier projet.');
        onProjectChange(projects[0].code);
      }
    }
  }, [selectedStatus, selectedProject, projects, hasProjects, onProjectChange]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-base">Sélectionner un statut</Label>
          <Button 
            type="button" 
            variant="outline" 
            size="icon" 
            onClick={handleRefreshStatuses} 
            title="Rafraîchir les statuts"
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <RadioGroup 
          value={selectedStatus} 
          onValueChange={(value) => onStatusChange(value as StatusCode)}
          className="grid grid-cols-2 gap-2"
        >
          {statuses.map((status) => (
            <StatusOption 
              key={status} 
              value={status} 
              label={STATUS_LABELS[status] || status}
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
        onClick={() => {
          // Validation supplémentaire avant l'appel à onSubmit
          if (selectedStatus === 'projet' && (!selectedProject || selectedProject === 'no-project' || selectedProject === 'select-project')) {
            toast.error("Veuillez sélectionner un projet");
            return;
          }
          onSubmit();
        }} 
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
