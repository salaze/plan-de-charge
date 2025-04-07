
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Status, StatusCode } from '@/types';
import { StatusCell } from './StatusCell';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';

interface Project {
  id: string;
  code: string;
  name: string;
  color: string;
}

interface LegendModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  statuses: Status[];  // Ajout des statuts dynamiques
}

export function LegendModal({ isOpen, onClose, projects, statuses }: LegendModalProps) {
  const { isAdmin } = useAuth();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Légende du Planning</DialogTitle>
          <DialogDescription>
            Explication des différents codes et couleurs utilisés dans le planning.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Types d'activités</h3>
              <div className="grid gap-2">
                {statuses.map((status) => (
                  <div key={status.id} className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}
                    >
                      {status.code}
                    </span>
                    <span className="text-sm text-muted-foreground">{status.label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {projects.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Projets</h3>
                <div className="grid gap-2">
                  {projects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`}
                        style={{ backgroundColor: project.color, color: '#fff' }}
                      >
                        {project.code}
                      </span>
                      <span className="text-sm text-muted-foreground">{project.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Période</h3>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary">
                    AM
                  </span>
                  <span className="text-sm text-muted-foreground">Matin</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary">
                    PM
                  </span>
                  <span className="text-sm text-muted-foreground">Après-midi</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Bordure noire</h3>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <StatusCell status="assistance" isHighlighted={true} isBadge={true} />
                  <span className="text-sm text-muted-foreground">
                    Indique une importance particulière
                  </span>
                </div>
              </div>
            </div>
            
            {isAdmin && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Règles d'administration</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Seuls les administrateurs peuvent modifier le planning</li>
                  <li>Vous pouvez ajouter ou modifier des projets dans la section Admin</li>
                  <li>Les calculs et statistiques se mettent à jour automatiquement</li>
                  <li>L'export Excel conserve toutes les couleurs et bordures</li>
                </ul>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <DialogFooter>
          <Button onClick={onClose}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
