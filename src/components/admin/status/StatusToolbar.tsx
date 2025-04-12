
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface StatusToolbarProps {
  onAddStatus: () => void;
}

export function StatusToolbar({ onAddStatus }: StatusToolbarProps) {
  return (
    <div className="flex justify-end mb-4">
      <Button onClick={onAddStatus} className="flex items-center">
        <Plus className="mr-2 h-4 w-4" />
        Ajouter un statut
      </Button>
    </div>
  );
}

export default StatusToolbar;
