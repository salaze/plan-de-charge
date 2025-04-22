
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
import { Edit, Trash } from 'lucide-react';
import { Status } from './types';

interface StatusTableProps {
  statuses: Status[];
  onEditStatus: (status: Status) => void;
  onDeleteStatus: (statusId: string) => void;
}

export function StatusTable({ statuses, onEditStatus, onDeleteStatus }: StatusTableProps) {
  return (
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
                    onClick={() => onEditStatus(status)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteStatus(status.id)}
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
  );
}
