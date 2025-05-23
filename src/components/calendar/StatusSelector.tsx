
import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { StatusCode, STATUS_COLORS, STATUS_LABELS } from '@/types';
import { cn } from '@/lib/utils';

interface StatusSelectorProps {
  value: StatusCode;
  onChange: (value: StatusCode) => void;
}

export function StatusSelector({ value, onChange }: StatusSelectorProps) {
  // Récupérer les statuts disponibles depuis localStorage
  const getAvailableStatuses = (): StatusCode[] => {
    try {
      const savedData = localStorage.getItem('planningData');
      const data = savedData ? JSON.parse(savedData) : { statuses: [] };
      
      // Si nous avons des statuts personnalisés, extraire les codes
      if (Array.isArray(data.statuses) && data.statuses.length > 0) {
        const statusCodes = data.statuses
          .filter((s: any) => s && s.code && s.code.trim() !== '') // Filtrer les codes vides
          .map((s: any) => s.code as StatusCode);
          
        return [...statusCodes, 'none'];
      }
    } catch (error) {
      console.error('Error fetching available statuses:', error);
      // Fall back to default statuses on error
    }
    
    // Statuts par défaut
    return ['assistance', 'vigi', 'formation', 'projet', 'conges', 'management', 
            'tp', 'coordinateur', 'absence', 'regisseur', 'demenagement', 'none'];
  };
  
  const statuses = getAvailableStatuses();
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "w-full justify-between",
            value && value !== 'none' && STATUS_COLORS[value]
          )}
        >
          {value && value !== 'none' ? STATUS_LABELS[value] : "Sélectionner un statut"}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-56" align="center">
        <div className="flex flex-col divide-y divide-border">
          {statuses.map((status) => (
            <button
              key={status || 'unknown-status'}
              className={cn(
                "p-2.5 text-left hover:bg-secondary transition-colors",
                status === value && "bg-secondary"
              )}
              onClick={() => onChange(status)}
            >
              {status !== 'none' ? (
                <div className="flex items-center">
                  {STATUS_COLORS[status] && (
                    <div 
                      className={cn(
                        "h-3 w-3 rounded-full mr-2",
                        STATUS_COLORS[status].split(' ')[0]
                      )} 
                    />
                  )}
                  {STATUS_LABELS[status]}
                </div>
              ) : (
                <span className="text-muted-foreground">Effacer</span>
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
