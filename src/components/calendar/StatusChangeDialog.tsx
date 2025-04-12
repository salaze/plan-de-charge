
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StatusSelectorForm } from './status/StatusSelectorForm';
import { StatusCode, DayPeriod } from '@/types';
import { ensureValidUuid } from '@/utils/idUtils';

interface StatusChangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (status: StatusCode, isHighlighted?: boolean, projectCode?: string) => void;
  currentStatus: StatusCode;
  isHighlighted?: boolean;
  projectCode?: string;
  projects: { id: string; code: string; name: string; color: string }[];
}

export function StatusChangeDialog({
  isOpen,
  onClose,
  onStatusChange,
  currentStatus,
  isHighlighted = false,
  projectCode,
  projects
}: StatusChangeDialogProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<DayPeriod>('AM');
  
  // Ensure projects have valid UUIDs
  const validatedProjects = projects.map(project => ({
    ...project,
    id: ensureValidUuid(project.id)
  }));
  
  // Reset selected period when dialog opens
  useEffect(() => {
    if (isOpen) {
      console.log("Dialog opened with status:", currentStatus, "highlighted:", isHighlighted, "projectCode:", projectCode);
    }
  }, [isOpen, currentStatus, isHighlighted, projectCode]);
  
  const handleSelectionConfirm = (status: StatusCode, isHighlighted: boolean, projectCode?: string) => {
    console.log("Sélection confirmée:", status, isHighlighted, projectCode);
    onStatusChange(status, isHighlighted, projectCode);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[425px] max-w-[90vw]">
        <DialogHeader>
          <DialogTitle>
            Modifier le statut {selectedPeriod === 'AM' ? '(Matin)' : '(Après-midi)'}
          </DialogTitle>
          <DialogDescription>
            Sélectionnez un statut pour cette période
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex space-x-2">
            <Button 
              variant={selectedPeriod === 'AM' ? "default" : "outline"} 
              onClick={() => setSelectedPeriod('AM')}
              className="flex-1"
            >
              Matin
            </Button>
            <Button 
              variant={selectedPeriod === 'PM' ? "default" : "outline"} 
              onClick={() => setSelectedPeriod('PM')}
              className="flex-1"
            >
              Après-midi
            </Button>
          </div>
          
          <StatusSelectorForm
            initialStatus={currentStatus}
            initialIsHighlighted={isHighlighted}
            initialProjectCode={projectCode || ''}
            selectedPeriod={selectedPeriod}
            projects={validatedProjects}
            onSubmit={handleSelectionConfirm}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
