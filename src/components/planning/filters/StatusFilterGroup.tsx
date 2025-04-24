
import React, { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { StatusCode, STATUS_LABELS } from '@/types';
import { useAvailableStatuses } from '@/hooks/useAvailableStatuses';

interface StatusFilterGroupProps {
  selectedStatuses: StatusCode[];
  onStatusToggle: (status: StatusCode) => void;
}

export function StatusFilterGroup({ selectedStatuses, onStatusToggle }: StatusFilterGroupProps) {
  const { statuses: databaseStatuses, isLoading } = useAvailableStatuses();
  const [availableStatuses, setAvailableStatuses] = useState<StatusCode[]>([
    'assistance', 'vigi', 'formation', 'projet', 'conges', 
    'management', 'tp', 'coordinateur', 'absence', 
    'regisseur', 'demenagement', 'permanence', 'parc'
  ]);
  
  // Mettre à jour les statuts disponibles lorsque les statuts de la base de données changent
  useEffect(() => {
    if (databaseStatuses && databaseStatuses.length > 0) {
      // Utiliser les statuts de la base de données, mais conserver le statut 'none'
      setAvailableStatuses([...databaseStatuses]);
      console.log('Statuts disponibles mis à jour depuis la base de données:', databaseStatuses);
    }
  }, [databaseStatuses]);

  // Écouter l'événement global de mise à jour des statuts
  useEffect(() => {
    const handleStatusesUpdated = () => {
      console.log("StatusFilterGroup: Événement statusesUpdated reçu");
    };
    
    window.addEventListener('statusesUpdated', handleStatusesUpdated);
    
    return () => {
      window.removeEventListener('statusesUpdated', handleStatusesUpdated);
    };
  }, []);

  return (
    <div className="space-y-3">
      <Label>Statuts</Label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
        {isLoading ? (
          <div className="col-span-full text-center text-sm text-muted-foreground">
            Chargement des statuts...
          </div>
        ) : availableStatuses.length === 0 ? (
          <div className="col-span-full text-center text-sm text-muted-foreground">
            Aucun statut disponible
          </div>
        ) : (
          availableStatuses.map((status) => (
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
          ))
        )}
      </div>
    </div>
  );
}
