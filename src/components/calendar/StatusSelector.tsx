
import React, { useEffect, useState } from 'react';
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
  const [statuses, setStatuses] = useState<StatusCode[]>([]);
  const [statusLabels, setStatusLabels] = useState<Record<string, string>>({...STATUS_LABELS});
  const [statusColors, setStatusColors] = useState<Record<string, string>>({...STATUS_COLORS});
  
  // Load statuses from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('planningData');
    const data = savedData ? JSON.parse(savedData) : { statuses: [] };
    
    // Update local state with custom statuses
    if (data.statuses && data.statuses.length > 0) {
      // Extract status codes
      const statusCodes = [...data.statuses.map((s: any) => s.code as StatusCode), ''];
      setStatuses(statusCodes);
      
      // Update labels and colors
      const newLabels = {...STATUS_LABELS};
      const newColors = {...STATUS_COLORS};
      
      data.statuses.forEach((s: any) => {
        if (s.code) {
          newLabels[s.code] = s.label;
          newColors[s.code] = s.color;
        }
      });
      
      setStatusLabels(newLabels);
      setStatusColors(newColors);
    } else {
      // Default statuses if no custom ones exist
      setStatuses([
        'assistance', 'vigi', 'formation', 'projet', 'conges', 
        'management', 'tp', 'coordinateur', 'absence', 
        'regisseur', 'demenagement', 'permanence', ''
      ]);
    }
  }, []);
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "w-full justify-between",
            value && statusColors[value]
          )}
        >
          {value ? statusLabels[value] || value : "Sélectionner un statut"}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-56" align="center">
        <div className="flex flex-col divide-y divide-border">
          {statuses.map((status) => (
            <button
              key={status}
              className={cn(
                "p-2.5 text-left hover:bg-secondary transition-colors",
                status === value && "bg-secondary"
              )}
              onClick={() => onChange(status)}
            >
              {status ? (
                <div className="flex items-center">
                  {statusColors[status] && (
                    <div 
                      className={cn(
                        "h-3 w-3 rounded-full mr-2",
                        statusColors[status].split(' ')[0]
                      )} 
                    />
                  )}
                  {statusLabels[status] || status}
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
