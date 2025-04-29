
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { DayPeriod, StatusCode } from '@/types';
import { SelectPeriod } from './SelectPeriod';
import ProjectSelector from './ProjectSelector';
// Importer fetchProjectByCode de notre fichier projets.ts
import { fetchProjectByCode } from '@/utils/supabase/projects';

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
    
    // Récupérer les informations fraîches du projet
    if (projectCode && projectCode !== 'select-project') {
      try {
        const freshProject = await fetchProjectByCode(projectCode);
        if (freshProject) {
          // Mettre à jour la liste des projets ou utiliser ces informations directement
          // selon l'architecture du composant
        }
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
        
        <div className="grid gap-4 py-4">
          <div className="flex justify-between">
            <Button 
              variant="outline"
              className={currentStatus === 'assistance' ? 'bg-yellow-300 text-yellow-800' : ''}
              onClick={() => handleStatusClick('assistance')}
            >
              Assistance
            </Button>
            <Button
              variant="outline"
              className={currentStatus === 'vigi' ? 'bg-red-500 text-white' : ''}
              onClick={() => handleStatusClick('vigi')}
            >
              Vigi
            </Button>
            <Button
              variant="outline"
              className={currentStatus === 'formation' ? 'bg-blue-500 text-white' : ''}
              onClick={() => handleStatusClick('formation')}
            >
              Formation
            </Button>
            <Button
              variant="outline"
              className={currentStatus === 'projet' ? 'bg-green-500 text-white' : ''}
              onClick={() => handleStatusClick('projet')}
            >
              Projet
            </Button>
            <Button
              variant="outline"
              className={currentStatus === 'conges' ? 'bg-amber-800 text-white' : ''}
              onClick={() => handleStatusClick('conges')}
            >
              Congés
            </Button>
            <Button
              variant="outline"
              className={currentStatus === 'management' ? 'bg-purple-500 text-white' : ''}
              onClick={() => handleStatusClick('management')}
            >
              Management
            </Button>
            <Button
              variant="outline"
              className={currentStatus === 'tp' ? 'bg-gray-400 text-gray-800' : ''}
              onClick={() => handleStatusClick('tp')}
            >
              Temps Partiel
            </Button>
            <Button
              variant="outline"
              className={currentStatus === 'coordinateur' ? 'bg-green-600 text-white' : ''}
              onClick={() => handleStatusClick('coordinateur')}
            >
              Coordinateur
            </Button>
            <Button
              variant="outline"
              className={currentStatus === 'absence' ? 'bg-pink-300 text-pink-800' : ''}
              onClick={() => handleStatusClick('absence')}
            >
              Autre Absence
            </Button>
            <Button
              variant="outline"
              className={currentStatus === 'regisseur' ? 'bg-blue-300 text-blue-800' : ''}
              onClick={() => handleStatusClick('regisseur')}
            >
              Régisseur
            </Button>
             <Button
              variant="outline"
              className={currentStatus === 'demenagement' ? 'bg-indigo-500 text-white' : ''}
              onClick={() => handleStatusClick('demenagement')}
            >
              Déménagement
            </Button>
            <Button
              variant="outline"
              className={currentStatus === 'permanence' ? 'bg-pink-600 text-white' : ''}
              onClick={() => handleStatusClick('permanence')}
            >
              Permanence
            </Button>
            <Button
              variant="outline"
              className={currentStatus === 'parc' ? 'bg-teal-500 text-white' : ''}
              onClick={() => handleStatusClick('parc')}
            >
              Parc
            </Button>
            <Button
              variant="outline"
              className={currentStatus === 'none' ? 'bg-transparent text-foreground' : ''}
              onClick={() => handleStatusClick('none')}
            >
              Aucun
            </Button>
          </div>

          <ProjectSelector
            projects={projects}
            selectedProject={selectedProjectCode}
            onProjectChange={handleProjectChange}
          />

          <div className="flex items-center space-x-2">
            <Checkbox
              id="highlight"
              checked={highlighted}
              onCheckedChange={(checked) => setHighlighted(checked === "indeterminate" ? false : checked)}
            />
            <Label htmlFor="highlight">Mettre en évidence</Label>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              placeholder="Ajouter une note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={() => onClose()}>Confirmer</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
