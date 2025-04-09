
import React, { useState, useEffect } from 'react';
import { Status, StatusCode, Project } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface StatusSelectorEnhancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (status: string, isHighlighted?: boolean, projectCode?: string) => void;
  projects: Project[];
  statuses: Status[];
}

export function StatusSelectorEnhanced({
  open,
  onOpenChange,
  onSelect,
  projects,
  statuses = []
}: StatusSelectorEnhancedProps) {
  const [selectedStatus, setSelectedStatus] = useState<StatusCode>('');
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [projectCode, setProjectCode] = useState<string>('');

  // Reset state when the modal is opened
  useEffect(() => {
    if (open) {
      setSelectedStatus('');
      setIsHighlighted(false);
      setProjectCode('');
    }
  }, [open]);

  const handleStatusChange = (status: StatusCode) => {
    setSelectedStatus(status);
    if (status !== 'project') {
      setProjectCode('');
    }
  };

  const handleApply = () => {
    if (selectedStatus === 'project' && projectCode) {
      onSelect('project', isHighlighted, projectCode);
    } else if (selectedStatus) {
      onSelect(selectedStatus, isHighlighted);
    }
    onOpenChange(false);
  };

  const handleClear = () => {
    onSelect('', false);
    onOpenChange(false);
  };

  const sortedStatuses = [...statuses].sort((a, b) => {
    const orderA = a.displayOrder || 0;
    const orderB = b.displayOrder || 0;
    return orderA - orderB;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier le statut</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <Select value={selectedStatus} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                {sortedStatuses.map((status) => (
                  <SelectItem key={status.code} value={status.code}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: status.color }}
                      />
                      <span>{status.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedStatus === 'project' && (
            <div className="space-y-2">
              <Label htmlFor="project">Projet</Label>
              <Select value={projectCode} onValueChange={setProjectCode}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un projet" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.code} value={project.code}>
                      {project.code} - {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="highlight" 
              checked={isHighlighted} 
              onCheckedChange={(checked) => setIsHighlighted(!!checked)} 
            />
            <Label htmlFor="highlight" className="text-sm">
              Mettre en évidence (bordure noire)
            </Label>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-end space-x-2">
          <Button variant="outline" type="button" onClick={handleClear}>
            Effacer
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            type="button" 
            onClick={handleApply}
            disabled={(selectedStatus === 'project' && !projectCode) || !selectedStatus}
          >
            Appliquer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
