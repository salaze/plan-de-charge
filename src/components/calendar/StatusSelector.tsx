
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
  const statuses: StatusCode[] = ['assistance', 'vigi', 'formation', 'conges', ''];
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "w-full justify-between",
            value && STATUS_COLORS[value]
          )}
        >
          {value ? STATUS_LABELS[value] : "Sélectionner un statut"}
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
                  <div 
                    className={cn(
                      "h-3 w-3 rounded-full mr-2",
                      STATUS_COLORS[status].split(' ')[0]
                    )} 
                  />
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
