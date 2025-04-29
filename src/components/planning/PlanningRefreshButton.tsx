
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface PlanningRefreshButtonProps {
  onRefresh: () => void;
  disabled: boolean;
}

export function PlanningRefreshButton({ onRefresh, disabled }: PlanningRefreshButtonProps) {
  return (
    <Button 
      variant="outline"
      size="sm"
      onClick={onRefresh}
      className="flex items-center gap-1"
      disabled={disabled}
    >
      <RefreshCw className="h-4 w-4" />
      <span>Actualiser</span>
    </Button>
  );
}
