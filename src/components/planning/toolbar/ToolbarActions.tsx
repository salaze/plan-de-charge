
import React from 'react';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

interface ToolbarActionsProps {
  onShowLegend: () => void;
}

export function ToolbarActions({ onShowLegend }: ToolbarActionsProps) {
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
    </div>
  );
}
