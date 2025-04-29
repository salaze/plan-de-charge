
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DayPeriod, StatusCode } from '@/types';
import { SelectPeriod } from './SelectPeriod';
import ProjectSelector from './ProjectSelector';
import { fetchProjectByCode } from '@/utils/supabase/projects';
import { StatusButtonGrid } from './StatusButtonGrid';
import { HighlightCheckbox } from './HighlightCheckbox';
import { NoteInput } from './NoteInput';

interface Project {
  id: string;
  code: string;
  name: string;
  color: string;
}

interface StatusChangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (status: StatusCode, isHighlighted?: boolean, projectCode?: string) => void;
  currentStatus: StatusCode;
  isHighlighted?: boolean;
  projectCode?: string;
  projects: Project[];
  selectedPeriod: DayPeriod;
}

export function StatusChangeDialog({
  isOpen,
  onClose,
  onStatusChange,
  currentStatus,
  isHighlighted = false,
  projectCode,
  projects,
  selectedPeriod
}: StatusChangeDialogProps) {
  const [note, setNote] = React.useState('');
  const [highlighted, setHighlighted] = React.useState(isHighlighted);
  const [selectedProjectCode, setSelectedProjectCode] = React.useState(projectCode || 'select-project');
  
  const handleStatusClick = (status: StatusCode) => {
    onStatusChange(status, highlighted, selectedProjectCode);
  };
  
  const handleProjectChange = async (projectCode: string) => {
    setSelectedProjectCode(projectCode);
    
    // Récupérer les informations fraîches du projet directement depuis Supabase
    if (projectCode && projectCode !== 'select-project') {
      try {
        // Cette fonction va chercher les données du projet en temps réel
        const freshProject = await fetchProjectByCode(projectCode);
        console.log("Projet récupéré depuis Supabase:", freshProject);
        // Les données du projet sont utilisées directement,
        // sans mise en cache ou duplication dans l'état local
      } catch (error) {
        console.error("Erreur lors de la récupération des données du projet:", error);
      }
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Modifier le statut</AlertDialogTitle>
          <AlertDialogDescription>
            Sélectionner un statut pour la période : {selectedPeriod}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <StatusButtonGrid currentStatus={currentStatus} onStatusClick={handleStatusClick} />

        <ProjectSelector
          projects={projects}
          selectedProject={selectedProjectCode}
          onProjectChange={handleProjectChange}
        />

        <HighlightCheckbox highlighted={highlighted} onChange={setHighlighted} />
        
        <NoteInput note={note} onChange={setNote} />
        
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={() => onClose()}>Confirmer</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
