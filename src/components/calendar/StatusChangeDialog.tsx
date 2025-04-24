
import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StatusSelectorEnhanced } from './StatusSelectorEnhanced';
import { StatusCode, DayPeriod } from '@/types';

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
  
  // Emit events when the dialog opens or closes
  useEffect(() => {
    if (isOpen) {
      console.log("Dialogue de statut ouvert, émission d'événement statusEditStart");
      const event = new CustomEvent('statusEditStart');
      window.dispatchEvent(event);
    } else {
      console.log("Dialogue de statut fermé, émission d'événement statusEditEnd");
      const event = new CustomEvent('statusEditEnd');
      window.dispatchEvent(event);
    }
  }, [isOpen]);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
