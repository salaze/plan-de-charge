
import React, { useState } from 'react';
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
import { StatusCode } from '@/types';
import { toast } from 'sonner';

interface ColorOption {
  value: string;
  label: string;
}

interface Status {
  id: string;
  code: StatusCode;
  label: string;
  color: string;
}

interface StatusFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (status: Status) => void;
  currentStatus: Status | null;
  existingCodes: string[];
}

export function StatusForm({ 
  open, 
  onOpenChange, 
  onSave, 
  currentStatus, 
  existingCodes 
}: StatusFormProps) {
  const [code, setCode] = useState<StatusCode>(currentStatus?.code || '' as StatusCode);
  const [label, setLabel] = useState(currentStatus?.label || '');
  const [color, setColor] = useState(currentStatus?.color || 'bg-green-500 text-white');

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setCode(currentStatus?.code || '' as StatusCode);
      setLabel(currentStatus?.label || '');
      setColor(currentStatus?.color || 'bg-green-500 text-white');
    }
  }, [open, currentStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || !label) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    // Vérifier si le code est déjà utilisé (sauf pour le statut en cours d'édition)
    const codeExists = existingCodes.includes(code) && code !== currentStatus?.code;
    
    if (codeExists) {
      toast.error('Ce code de statut existe déjà');
      return;
    }
    
    onSave({
      id: currentStatus?.id || '',
      code,
      label,
      color
    });
    
    onOpenChange(false);
  };
  
  // Liste prédéfinie de classes Tailwind pour les couleurs
  const colorOptions: ColorOption[] = [
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {currentStatus ? 'Modifier un statut' : 'Ajouter un statut'}
          </DialogTitle>
          <DialogDescription>
            {currentStatus 
              ? 'Modifiez les détails du statut existant' 
              : 'Complétez les informations pour ajouter un nouveau statut'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
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
              <div className="grid grid-cols-3 gap-2">
                {colorOptions.map((colorOption) => (
                  <Button
                    key={colorOption.value}
                    type="button"
                    variant="outline"
                    className={`h-10 ${color === colorOption.value ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setColor(colorOption.value)}
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
