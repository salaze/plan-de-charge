
import React from 'react';
import { RadioGroup } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { StatusCode } from '@/types';
import { StatusOption } from './StatusOption';

interface StatusOptionsListProps {
  selectedStatus: StatusCode;
  statuses: StatusCode[] | string[];
  onStatusChange: (status: StatusCode) => void;
  isLoading: boolean;
}

export function StatusOptionsList({ 
  selectedStatus, 
  statuses, 
  onStatusChange,
  isLoading
}: StatusOptionsListProps) {
  return (
    <div className="space-y-3">
      <Label className="text-base">Sélectionner un statut</Label>
      <RadioGroup 
        value={selectedStatus} 
        onValueChange={(value) => onStatusChange(value as StatusCode)}
        className="grid grid-cols-2 gap-2"
      >
        {statuses.map((status) => (
          <StatusOption 
            key={status} 
            value={status as StatusCode} 
            label={status as string} 
          />
        ))}
      </RadioGroup>
    </div>
  );
}
