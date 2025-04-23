
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { StatusFormProps } from './types';
import { StatusCode } from '@/types';

export function StatusForm({
  code,
  label,
  color,
  onCodeChange,
  onLabelChange,
  onColorChange,
  onSubmit,
  onClose
}: StatusFormProps) {
  const colorOptions = [
    { value: 'bg-green-500 text-white', label: 'Vert' },
    { value: 'bg-blue-500 text-white', label: 'Bleu' },
    { value: 'bg-red-500 text-white', label: 'Rouge' },
    { value: 'bg-yellow-500 text-black', label: 'Jaune' },
    { value: 'bg-purple-500 text-white', label: 'Violet' },
    { value: 'bg-pink-500 text-white', label: 'Rose' },
    { value: 'bg-orange-500 text-white', label: 'Orange' },
    { value: 'bg-teal-500 text-white', label: 'Turquoise' },
    { value: 'bg-gray-500 text-white', label: 'Gris' },
  ];

  return (
    <form onSubmit={onSubmit}>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="status-code">Code du statut</Label>
          <Input
            id="status-code"
            placeholder="assistance"
            value={code}
            onChange={(e) => onCodeChange(e.target.value as StatusCode)}
          />
          <p className="text-xs text-muted-foreground">Exemple: assistance, vigi, projet, etc.</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status-label">Libellé du statut</Label>
          <Input
            id="status-label"
            placeholder="Assistance"
            value={label}
            onChange={(e) => onLabelChange(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status-color">Couleur</Label>
          <div className="grid grid-cols-3 gap-2">
            {colorOptions.map((colorOption) => (
              <Button
                key={colorOption.value}
                type="button"
                variant="outline"
                className={`h-10 ${color === colorOption.value ? 'ring-2 ring-primary' : ''}`}
                onClick={() => onColorChange(colorOption.value)}
              >
                <div className={`w-full h-6 rounded ${colorOption.value} flex items-center justify-center`}>
                  {colorOption.label}
                </div>
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
