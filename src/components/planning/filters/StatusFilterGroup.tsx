
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { StatusCode, STATUS_LABELS } from '@/types';

interface StatusFilterGroupProps {
  selectedStatuses: StatusCode[];
  onStatusToggle: (status: StatusCode) => void;
}

export function StatusFilterGroup({ selectedStatuses, onStatusToggle }: StatusFilterGroupProps) {
  // Liste de tous les statuts disponibles
  const availableStatuses: StatusCode[] = [
    'assistance', 'vigi', 'formation', 'projet', 'conges', 
    'management', 'tp', 'coordinateur', 'absence', 
    'regisseur', 'demenagement', 'permanence', 'parc'  // Ajout de 'parc'
  ];

  return (
    <div className="space-y-3">
      <Label>Statuts</Label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
        {availableStatuses.map((status) => (
          <div key={status} className="flex items-center space-x-2">
            <Checkbox 
              id={`status-${status}`} 
              checked={selectedStatuses.includes(status)}
              onCheckedChange={() => onStatusToggle(status)}
            />
            <Label 
              htmlFor={`status-${status}`}
              className="text-sm cursor-pointer"
            >
              {STATUS_LABELS[status]}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
