
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Edit, Plus, Trash } from 'lucide-react';
import { generateId } from '@/utils';
import { StatusCode, STATUS_LABELS, STATUS_COLORS } from '@/types';

interface Status {
  id: string;
  code: StatusCode;
  label: string;
  color: string;
}

interface StatusManagerProps {
  statuses: Status[];
  onStatusesChange: (statuses: Status[]) => void;
}

export function StatusManager({ statuses, onStatusesChange }: StatusManagerProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<Status | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusToDelete, setStatusToDelete] = useState<string>('');
  
  const [code, setCode] = useState<StatusCode>('');
  const [label, setLabel] = useState('');
  const [color, setColor] = useState('bg-green-500 text-white');
  
  useEffect(() => {
    // Mettre à jour les STATUS_LABELS et STATUS_COLORS globaux
    if (statuses && statuses.length > 0) {
      statuses.forEach((status) => {
        if (status.code) {
          // @ts-ignore - Mise à jour dynamique
          STATUS_LABELS[status.code] = status.label;
          // @ts-ignore - Mise à jour dynamique
          STATUS_COLORS[status.code] = status.color;
        }
      });
      
      // Déclencher un événement personnalisé pour informer les autres composants
      const event = new CustomEvent('statusesUpdated');
      window.dispatchEvent(event);
    }
  }, [statuses]);
  
  const handleAddStatus = () => {
    setCurrentStatus(null);
    setCode('' as StatusCode);
    setLabel('');
    setColor('bg-green-500 text-white');
    setFormOpen(true);
  };
  
  const handleEditStatus = (status: Status) => {
    setCurrentStatus(status);
    setCode(status.code);
    setLabel(status.label);
    setColor(status.color);
    setFormOpen(true);
  };
  
  const handleDeleteStatus = (statusId: string) => {
    setStatusToDelete(statusId);
    setDeleteDialogOpen(true);
  };
  
  const confirmDeleteStatus = () => {
    if (!statusToDelete) return;
    
    const updatedStatuses = statuses.filter(status => status.id !== statusToDelete);
    onStatusesChange(updatedStatuses);
    
    toast.success('Statut supprimé avec succès');
    setDeleteDialogOpen(false);
    setStatusToDelete('');
  };
  
  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || !label) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    // Vérifier si le code est déjà utilisé (sauf pour le statut en cours d'édition)
    const codeExists = statuses.some(s => 
      s.code === code && s.id !== (currentStatus?.id || '')
    );
    
    if (codeExists) {
      toast.error('Ce code de statut existe déjà');
      return;
    }
    
    let updatedStatuses: Status[];
    
    if (currentStatus) {
      // Mettre à jour un statut existant
      updatedStatuses = statuses.map(status => 
        status.id === currentStatus.id 
          ? { ...status, code, label, color } 
          : status
      );
      toast.success('Statut modifié avec succès');
    } else {
      // Ajouter un nouveau statut
      const newStatus: Status = {
        id: generateId(),
        code,
        label,
        color
      };
      updatedStatuses = [...statuses, newStatus];
      
      // Mettre à jour les STATUS_LABELS et STATUS_COLORS globaux
      // @ts-ignore - Mise à jour dynamique
      STATUS_LABELS[code] = label;
      // @ts-ignore - Mise à jour dynamique
      STATUS_COLORS[code] = color;
      
      toast.success('Statut ajouté avec succès');
    }
    
    onStatusesChange(updatedStatuses);
    
    // Déclencher un événement personnalisé pour informer les autres composants
    const event = new CustomEvent('statusesUpdated');
    window.dispatchEvent(event);
    
    setFormOpen(false);
  };
  
  // Liste prédéfinie de classes Tailwind pour les couleurs
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
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Gestion des statuts</CardTitle>
          <CardDescription>
            Ajouter, modifier ou supprimer des statuts et leur code associé
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-4">
            <Button onClick={handleAddStatus} className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un statut
            </Button>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Libellé</TableHead>
                <TableHead>Couleur</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statuses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                    Aucun statut disponible
                  </TableCell>
                </TableRow>
              ) : (
                statuses.map((status) => (
                  <TableRow key={status.id}>
                    <TableCell className="font-medium">{status.code}</TableCell>
                    <TableCell>{status.label}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div 
                          className={`w-20 h-6 rounded-full mr-2 flex items-center justify-center text-xs ${status.color}`}
                        >
                          {status.code}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditStatus(status)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteStatus(status.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
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
          
          <form onSubmit={handleSaveStatus}>
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
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce statut ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteStatus}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
