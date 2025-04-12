
import React from 'react';
import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusColorOptions } from './StatusColorOptions';
import { StatusCode } from '@/types';

interface StatusFormProps {
  code: StatusCode;
  setCode: (code: StatusCode) => void;
  label: string;
  setLabel: (label: string) => void;
  color: string;
  setColor: (color: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  colorOptions: { value: string; label: string }[];
}

export function StatusForm({
  code,
  setCode,
  label,
  setLabel,
  color,
  setColor,
  onSubmit,
  onCancel,
  colorOptions
}: StatusFormProps) {
  return (
    <form onSubmit={onSubmit}>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="status-code">Code du statut</Label>
          <Input
            id="status-code"
            placeholder="assistance"
            value={code}
            onChange={(e) => setCode(e.target.value as StatusCode)}
          />
          <p className="text-xs text-muted-foreground">Exemple: assistance, vigi, projet, etc.</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status-label">Libellé du statut</Label>
          <Input
            id="status-label"
            placeholder="Assistance"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status-color">Couleur</Label>
          <StatusColorOptions 
            colorOptions={colorOptions} 
            selectedColor={color} 
            onColorChange={setColor} 
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">Enregistrer</Button>
      </DialogFooter>
    </form>
  );
}

export default StatusForm;
