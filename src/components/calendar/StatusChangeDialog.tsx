
import React, { useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StatusSelectorEnhanced } from './StatusSelectorEnhanced';
import { StatusCode, DayPeriod } from '@/types';
import { Loader2 } from 'lucide-react';

interface StatusChangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (status: StatusCode, isHighlighted?: boolean, projectCode?: string) => void;
  currentStatus: StatusCode;
  isHighlighted?: boolean;
  projectCode?: string;
  projects: { id: string; code: string; name: string; color: string }[];
  selectedPeriod: DayPeriod;
}

export function StatusChangeDialog({
  isOpen,
  onClose,
  onStatusChange,
  currentStatus,
  isHighlighted,
  projectCode,
  projects,
  selectedPeriod
}: StatusChangeDialogProps) {
  // Convert FULL to AM for display purposes
  const displayPeriod = selectedPeriod === 'FULL' ? 'AM' : selectedPeriod;
  
  // Garder une trace des événements émis pour éviter les duplications
  const hasEmittedStartEvent = useRef(false);
  const hasEmittedEndEvent = useRef(false);
  
  // Émettre des événements quand le dialogue s'ouvre ou se ferme
  useEffect(() => {
    if (isOpen && !hasEmittedStartEvent.current) {
      console.log("Dialogue de statut ouvert, émission d'événement statusEditStart");
      hasEmittedStartEvent.current = true;
      hasEmittedEndEvent.current = false;
      
      const event = new CustomEvent('statusEditStart');
      window.dispatchEvent(event);
    } else if (!isOpen && !hasEmittedEndEvent.current && hasEmittedStartEvent.current) {
      console.log("Dialogue de statut fermé, émission d'événement statusEditEnd");
      hasEmittedEndEvent.current = true;
      hasEmittedStartEvent.current = false;
      
      const event = new CustomEvent('statusEditEnd');
      window.dispatchEvent(event);
    }
  }, [isOpen]);
  
  // Nettoyage à la destruction du composant
  useEffect(() => {
    return () => {
      // S'assurer d'émettre statusEditEnd si le composant est démonté alors que le dialogue est ouvert
      if (hasEmittedStartEvent.current && !hasEmittedEndEvent.current) {
        console.log("Nettoyage du dialogue, émission d'événement statusEditEnd");
        const event = new CustomEvent('statusEditEnd');
        window.dispatchEvent(event);
      }
    };
  }, []);
  
  // Gestionnaire de fermeture personnalisé pour s'assurer que l'événement est émis
  const handleClose = () => {
    // Le flag sera mis à jour par l'effet
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] max-w-[90vw]">
        <DialogHeader>
          <DialogTitle>
            Modifier le statut {displayPeriod === 'AM' ? '(Matin)' : '(Après-midi)'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex space-x-2">
            <Button 
              variant={displayPeriod === 'AM' ? "default" : "outline"} 
              disabled
              className="flex-1"
            >
              Matin
            </Button>
            <Button 
              variant={displayPeriod === 'PM' ? "default" : "outline"} 
              disabled
              className="flex-1"
            >
              Après-midi
            </Button>
          </div>
          
          <StatusSelectorEnhanced 
            value={currentStatus}
            onChange={onStatusChange}
            projects={projects}
            isHighlighted={isHighlighted}
            projectCode={projectCode}
            selectedPeriod={displayPeriod}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
