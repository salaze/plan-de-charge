import React, { useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { Status, StatusCode, STATUS_COLORS, STATUS_LABELS } from '@/types';
import { cn } from '@/lib/utils';
import { statusService } from '@/services/supabase';

interface StatusSelectorProps {
  value: StatusCode;
  onChange: (value: StatusCode) => void;
}

export function StatusSelector({ value, onChange }: StatusSelectorProps) {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [statusLabels, setStatusLabels] = useState<Record<string, string>>({...STATUS_LABELS});
  const [statusColors, setStatusColors] = useState<Record<string, string>>({...STATUS_COLORS});
  
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const fetchedStatuses = await statusService.getAll();
        
        if (fetchedStatuses && fetchedStatuses.length > 0) {
          const sortedStatuses = [...fetchedStatuses].sort((a, b) => {
            const orderA = a.displayOrder || 999;
            const orderB = b.displayOrder || 999;
            return orderA - orderB;
          });
          
          setStatuses(sortedStatuses);
          
          const newLabels = {...STATUS_LABELS};
          const newColors = {...STATUS_COLORS};
          
          sortedStatuses.forEach((s) => {
            if (s.code) {
              newLabels[s.code] = s.label;
              newColors[s.code] = s.color;
            }
          });
          
          setStatusLabels(newLabels);
          setStatusColors(newColors);
        } else {
          console.log('No statuses found in Supabase, using defaults');
        }
      } catch (error) {
        console.error('Error fetching statuses:', error);
      }
    };
    
    fetchStatuses();
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
        <div className="flex flex-col divide-y divide-border max-h-[300px] overflow-y-auto">
          {statuses.map((status) => (
            <button
              key={status.id}
              className={cn(
                "p-2.5 text-left hover:bg-secondary transition-colors",
                status.code === value && "bg-secondary"
              )}
              onClick={() => onChange(status.code)}
            >
              <div className="flex items-center">
                <div 
                  className={cn(
                    "h-3 w-3 rounded-full mr-2",
                    status.color.split(' ')[0]
                  )} 
                />
                {status.label}
              </div>
            </button>
          ))}
          <button
            className={cn(
              "p-2.5 text-left hover:bg-secondary transition-colors",
              value === '' && "bg-secondary"
            )}
            onClick={() => onChange('')}
          >
            <span className="text-muted-foreground">Effacer</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
