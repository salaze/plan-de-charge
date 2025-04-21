
import React from 'react';
import { EmployeeTab } from '@/components/admin/EmployeeTab';

interface EmployeesTabProps {
  employees: any[];
  onEmployeesChange: (employees: any[]) => void;
}

export function EmployeesTab({ employees, onEmployeesChange }: EmployeesTabProps) {
  return (
    <EmployeeTab
      employees={employees}
      onEmployeesChange={onEmployeesChange}
    />
  );
}
