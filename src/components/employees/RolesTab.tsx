
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RoleManagement } from '@/components/employees/RoleManagement';
import { Employee } from '@/types';
import { employeeService } from '@/services/jsonStorage';

interface RolesTabProps {
  employees: Employee[];
  onEmployeesChange: (employees: Employee[]) => void;
}

export function RolesTab({ employees, onEmployeesChange }: RolesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des rôles</CardTitle>
        <CardDescription>
          Attribution des rôles d'accès aux employés
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RoleManagement 
          employees={employees} 
          onEmployeesChange={onEmployeesChange} 
        />
      </CardContent>
    </Card>
  );
}
