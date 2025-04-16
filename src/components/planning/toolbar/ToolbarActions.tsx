
import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter, Info } from 'lucide-react';

interface ToolbarActionsProps {
  hasActiveFilters: boolean;
  onShowLegend: () => void;
  onShowFilters: () => void;
}

export function ToolbarActions({ 
  hasActiveFilters, 
  onShowLegend, 
  onShowFilters 
}: ToolbarActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        variant="outline" 
        onClick={onShowLegend}
        className="transition-all hover:bg-secondary"
      >
        <Info className="mr-2 h-4 w-4" />
        Légende
      </Button>
      
      <Button 
        variant={hasActiveFilters ? "default" : "outline"}
        className={hasActiveFilters ? "" : "transition-all hover:bg-secondary"}
        onClick={onShowFilters}
      >
        <Filter className="mr-2 h-4 w-4" />
        Filtres {hasActiveFilters && "(Actifs)"}
      </Button>
    </div>
  );
}
