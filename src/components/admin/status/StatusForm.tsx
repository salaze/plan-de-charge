
import React, { useState, useEffect } from 'react';
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
import { Status, StatusCode } from '@/types';
import { toast } from 'sonner';

interface ColorOption {
  value: string;
  label: string;
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
  const [displayOrder, setDisplayOrder] = useState<number>(currentStatus?.displayOrder || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      console.log('Status form opened with current status:', currentStatus);
      setCode(currentStatus?.code || '' as StatusCode);
      setLabel(currentStatus?.label || '');
      setColor(currentStatus?.color || 'bg-green-500 text-white');
      setDisplayOrder(currentStatus?.displayOrder || 0);
      setIsSubmitting(false);
    }
  }, [open, currentStatus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!code || !label) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        setIsSubmitting(false);
        return;
      }
      
      // Vérifier si le code est déjà utilisé (sauf pour le statut en cours d'édition)
      const codeExists = existingCodes.includes(code) && code !== currentStatus?.code;
      
      if (codeExists) {
        toast.error('Ce code de statut existe déjà');
        setIsSubmitting(false);
        return;
      }
      
      const statusData: Status = {
        id: currentStatus?.id || '',
        code,
        label,
        color,
        displayOrder: displayOrder || 0
      };

      console.log('Saving status:', statusData);
      onSave(statusData);
      
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      toast.error('Une erreur est survenue lors de l\'enregistrement');
    } finally {
      setIsSubmitting(false);
    }
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
    { value: 'bg-indigo-500 text-white', label: 'Indigo' },
    { value: 'bg-amber-800 text-white', label: 'Marron' },
    { value: 'bg-pink-300 text-pink-800', label: 'Rose pâle' },
    { value: 'bg-blue-300 text-blue-800', label: 'Bleu pâle' },
  ];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isSubmitting && onOpenChange(isOpen)}>
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
              <Label htmlFor="status-code">Code du statut *</Label>
              <Input
                id="status-code"
                placeholder="assistance"
                value={code}
                onChange={(e) => setCode(e.target.value as StatusCode)}
                required
              />
              <p className="text-xs text-muted-foreground">Exemple: assistance, vigi, projet, etc.</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status-label">Libellé du statut *</Label>
              <Input
                id="status-label"
                placeholder="Assistance"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="display-order">Ordre d'affichage</Label>
              <Input
                id="display-order"
                type="number"
                min="0"
                placeholder="0"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">Les statuts avec les valeurs les plus basses apparaîtront en premier</p>
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
