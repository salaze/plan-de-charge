
import React, { useState, useEffect } from 'react';
import { RadioGroup } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { StatusCode } from '@/types';
import { StatusOption } from '../StatusOption';
import { useStatusOptions } from '@/hooks/useStatusOptions';
import { Skeleton } from '@/components/ui/skeleton';

interface StatusOptionsListProps {
  selectedStatus: StatusCode;
  onStatusChange: (status: StatusCode) => void;
}

export function StatusOptionsList({ selectedStatus, onStatusChange }: StatusOptionsListProps) {
  // Use our custom hook to get available statuses
  const { availableStatuses, loading } = useStatusOptions();
  const [localLoading, setLocalLoading] = useState(true);
  
  // Set a short timeout to avoid showing loading skeleton for fast loads
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setLocalLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setLocalLoading(true);
    }
  }, [loading]);
  
  return (
    <div className="space-y-3">
      <Label className="text-base">Sélectionner un statut</Label>
      <RadioGroup 
        value={selectedStatus} 
        onValueChange={(value) => onStatusChange(value as StatusCode)}
        className="grid grid-cols-2 gap-2"
      >
        {localLoading ? (
          // Show skeleton loading UI
          <>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton 
                key={i} 
                className="w-full h-10 rounded-md"
              />
            ))}
          </>
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
