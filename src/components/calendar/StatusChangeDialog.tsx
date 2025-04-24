
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StatusSelectorEnhanced } from './StatusSelectorEnhanced';
import { StatusCode } from '@/types';

interface StatusChangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (status: StatusCode, isHighlighted?: boolean, projectCode?: string) => void;
  currentStatus: StatusCode;
  isHighlighted?: boolean;
  projectCode?: string;
  projects: { id: string; code: string; name: string; color: string }[];
  selectedPeriod: 'AM' | 'PM';
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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-w-[90vw]">
        <DialogHeader>
          <DialogTitle>
            Modifier le statut {selectedPeriod === 'AM' ? '(Matin)' : '(Après-midi)'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex space-x-2">
            <Button 
              variant={selectedPeriod === 'AM' ? "default" : "outline"} 
              disabled
              className="flex-1"
            >
              Matin
            </Button>
            <Button 
              variant={selectedPeriod === 'PM' ? "default" : "outline"} 
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
            selectedPeriod={selectedPeriod}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
