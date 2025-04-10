
import React, { useState } from 'react';
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
}

export function StatusChangeDialog({
  isOpen,
  onClose,
  onStatusChange,
  currentStatus,
  isHighlighted,
  projectCode,
  projects
}: StatusChangeDialogProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM');
  
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
