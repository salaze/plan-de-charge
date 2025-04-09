
import React, { useState, useEffect } from 'react';
import { StatusSelector } from './StatusSelector';
import { Status, StatusCode } from '@/types';
import { Project } from '@/types';

interface StatusSelectorEnhancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (status: string, isHighlighted?: boolean, projectCode?: string) => void;
  projects: Project[];
  statuses?: Status[];
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
    
    // Si on sélectionne un projet, on ouvre la sélection de projet
    if (status === 'projet') {
      return;
    }
    
    // Sinon on applique directement le statut
    onSelect(status, isHighlighted);
    onOpenChange(false);
  };

  const handleProjectSelect = (code: string) => {
    onSelect('projet', isHighlighted, code);
    onOpenChange(false);
  };

  const handleToggleHighlight = () => {
    setIsHighlighted(!isHighlighted);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-card p-4 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="font-medium text-lg mb-4">Sélectionner un statut</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Statut</label>
            <StatusSelector value={selectedStatus} onChange={handleStatusChange} />
          </div>
          
          {selectedStatus === 'projet' && (
            <div>
              <label className="block text-sm font-medium mb-1">Projet</label>
              <select
                className="w-full p-2 border rounded"
                value={projectCode}
                onChange={(e) => setProjectCode(e.target.value)}
              >
                <option value="">Sélectionner un projet</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.code}>
                    {project.code} - {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="highlight"
              checked={isHighlighted}
              onChange={handleToggleHighlight}
              className="mr-2"
            />
            <label htmlFor="highlight" className="text-sm">
              Mettre en évidence (bordure noire)
            </label>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              className="px-4 py-2 border rounded hover:bg-muted"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </button>
            
            {selectedStatus === 'projet' ? (
              <button
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                onClick={() => projectCode && handleProjectSelect(projectCode)}
                disabled={!projectCode}
              >
                Appliquer
              </button>
            ) : (
              <button
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                onClick={() => handleStatusChange(selectedStatus)}
                disabled={!selectedStatus}
              >
                Appliquer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
