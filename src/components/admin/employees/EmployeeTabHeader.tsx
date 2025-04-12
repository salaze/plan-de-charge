
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface EmployeeTabHeaderProps {
  onDeleteAllEmployees: () => void;
}

export function EmployeeTabHeader({ onDeleteAllEmployees }: EmployeeTabHeaderProps) {
  return (
    <div className="mb-4 flex justify-end">
      <Button 
        variant="destructive"
        onClick={onDeleteAllEmployees}
        className="flex items-center gap-2"
      >
        <Trash2 className="h-4 w-4" />
        Supprimer tous les employés
      </Button>
    </div>
  );
}
