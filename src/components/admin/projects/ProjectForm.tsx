
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { ProjectFormData } from './types';

interface ProjectFormProps {
  formData: ProjectFormData;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  onChange: (field: keyof ProjectFormData, value: string) => void;
}

export function ProjectForm({
  formData,
  onSubmit,
  onClose,
  onChange
}: ProjectFormProps) {
  const colorOptions = [
    '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#00BCD4',
    '#F44336', '#E91E63', '#673AB7', '#3F51B5', '#009688'
  ];

  return (
    <form onSubmit={onSubmit}>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="project-code">Code du projet</Label>
          <Input
            id="project-code"
            placeholder="P001"
            value={formData.code}
            onChange={(e) => onChange('code', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="project-name">Nom du projet</Label>
          <Input
            id="project-name"
            placeholder="Développement interne"
            value={formData.name}
            onChange={(e) => onChange('name', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="project-color">Couleur</Label>
          <div className="grid grid-cols-5 gap-2">
            {colorOptions.map((color) => (
              <Button
                key={color}
                type="button"
                variant="outline"
                className={`h-10 ${formData.color === color ? 'ring-2 ring-primary' : ''}`}
                onClick={() => onChange('color', color)}
              >
                <div 
                  className="w-full h-6 rounded" 
                  style={{ backgroundColor: color }} 
                />
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit">Enregistrer</Button>
      </DialogFooter>
    </form>
  );
}
