
import React from 'react';
import { RadioGroup } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { StatusCode } from '@/types';
import { StatusOption } from '../StatusOption';
import { useStatusOptions } from '@/hooks/useStatusOptions';

interface StatusOptionsListProps {
  selectedStatus: StatusCode;
  onStatusChange: (status: StatusCode) => void;
}

export function StatusOptionsList({ selectedStatus, onStatusChange }: StatusOptionsListProps) {
  // Use our custom hook to get available statuses
  const { availableStatuses, loading } = useStatusOptions();
  
  return (
    <div className="space-y-3">
      <Label className="text-base">Sélectionner un statut</Label>
      <RadioGroup 
        value={selectedStatus} 
        onValueChange={(value) => onStatusChange(value as StatusCode)}
        className="grid grid-cols-2 gap-2"
      >
        {loading ? (
          <div>Chargement des statuts...</div>
        ) : (
          availableStatuses.map((status) => (
            <StatusOption 
              key={status.value} 
              value={status.value} 
              label={status.label} 
            />
          ))
        )}
      </RadioGroup>
    </div>
  );
}
