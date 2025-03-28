
import React from 'react';
import { Employee, UserRole } from '@/types';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EmployeeRoleSelectorProps {
  employee: Employee;
  onRoleChange: (employeeId: string, newRole: UserRole) => void;
}

export function EmployeeRoleSelector({ employee, onRoleChange }: EmployeeRoleSelectorProps) {
  const handleRoleChange = (value: string) => {
    const newRole = value as UserRole;
    onRoleChange(employee.id, newRole);
    toast.success(`Rôle de ${employee.name} modifié en ${newRole === 'admin' ? 'Administrateur' : 'Employé'}`);
  };

  return (
    <Select
      value={employee.role || 'employee'}
      onValueChange={handleRoleChange}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sélectionner un rôle" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="admin">Administrateur</SelectItem>
        <SelectItem value="employee">Employé</SelectItem>
      </SelectContent>
    </Select>
  );
}
