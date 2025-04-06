
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash, Plus, Move } from 'lucide-react';
import { Status } from '@/types';
import { toast } from 'sonner';

interface StatusListProps {
  statuses: Status[];
  onAddStatus: () => void;
  onEditStatus: (status: Status) => void;
  onDeleteStatus: (statusId: string) => void;
}

export function StatusList({ 
  statuses, 
  onAddStatus, 
  onEditStatus, 
  onDeleteStatus 
}: StatusListProps) {
  // Gestion du tri des statuts (si besoin ultérieurement)
  const handleMoveStatus = (statusId: string, direction: 'up' | 'down') => {
    // Cette fonction pourrait être implémentée plus tard pour réorganiser les statuts
    toast.info('La fonctionnalité de réorganisation sera disponible prochainement');
  };
  
  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={onAddStatus} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un statut
        </Button>
      </div>
      
      <div className="rounded-md border">
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
                        className={`w-20 h-6 rounded-full flex items-center justify-center text-xs ${status.color}`}
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
                        onClick={() => onEditStatus(status)}
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteStatus(status.id)}
                        title="Supprimer"
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
      </div>
    </>
  );
}
