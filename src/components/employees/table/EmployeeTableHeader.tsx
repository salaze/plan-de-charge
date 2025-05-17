
import React from 'react';
import { User, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmployeeTableHeaderProps {
  onAddEmployee: () => void;
  disabled?: boolean;
}

export function EmployeeTableHeader({
  onAddEmployee,
  disabled = false
}: EmployeeTableHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <User className="h-5 w-5" />
        <span>Liste des employés</span>
      </h2>
      <Button 
        onClick={onAddEmployee} 
        size="sm" 
        className="flex items-center gap-1"
        disabled={disabled}
      >
        <UserPlus className="h-4 w-4" />
        <span>Ajouter</span>
      </Button>
    </div>
  );
}
