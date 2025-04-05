
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Project } from '@/types';

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentProject: Project | null;
  code: string;
  setCode: (code: string) => void;
  name: string;
  setName: (name: string) => void;
  color: string;
  setColor: (color: string) => void;
  onSave: (e: React.FormEvent) => void;
}

export function ProjectForm({
  open,
  onOpenChange,
  currentProject,
  code,
  setCode,
  name,
  setName,
  color,
  setColor,
  onSave
}: ProjectFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {currentProject ? 'Modifier un projet' : 'Ajouter un projet'}
          </DialogTitle>
          <DialogDescription>
            {currentProject 
              ? 'Modifiez les détails du projet existant' 
              : 'Complétez les informations pour ajouter un nouveau projet'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={onSave}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-code">Code du projet</Label>
              <Input
                id="project-code"
                placeholder="P001"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="project-name">Nom du projet</Label>
              <Input
                id="project-name"
                placeholder="Développement interne"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="project-color">Couleur</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="project-color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-24 h-10"
                />
                <div 
                  className="flex-1 h-10 rounded-md" 
                  style={{ backgroundColor: color }} 
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">Enregistrer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
