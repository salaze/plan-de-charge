
import React from 'react';
import { RoleManagement } from '@/components/employees/RoleManagement';

interface RolesTabProps {
  employees: any[];
  onEmployeesChange: (employees: any[]) => void;
}

export function RolesTab({ employees, onEmployeesChange }: RolesTabProps) {
  return (
    <RoleManagement
      employees={employees}
      onEmployeesChange={onEmployeesChange}
    />
  );
}
