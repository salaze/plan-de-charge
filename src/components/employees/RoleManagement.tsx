import React from 'react';
import { toast } from 'sonner';
import { Employee, UserRole } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmployeeRoleSelector } from './EmployeeRoleSelector';
import { useAuth } from '@/contexts/AuthContext';
interface RoleManagementProps {
  employees: Employee[];
  onEmployeesChange: (updatedEmployees: Employee[]) => void;
}
export function RoleManagement({
  employees,
  onEmployeesChange
}: RoleManagementProps) {
  const {
    updateUserRoles
  } = useAuth();
  const handleRoleChange = (employeeId: string, newRole: UserRole) => {
    // Mettre à jour le rôle dans le contexte d'authentification
    updateUserRoles(employeeId, newRole);

    // Mettre à jour la liste des employés localement
    const updatedEmployees = employees.map(emp => {
      if (emp.id === employeeId) {
        return {
          ...emp,
          role: newRole
        };
      }
      return emp;
    });
    onEmployeesChange(updatedEmployees);
  };
  return <Card>
      <CardHeader>
        <CardTitle>Gestion des rôles</CardTitle>
        <CardDescription>
          Attribuez des rôles d'administrateur ou d'employé à votre équipe
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead className="remplace Email par UID">Email</TableHead>
              <TableHead>Poste</TableHead>
              <TableHead>Rôle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map(employee => <TableRow key={employee.id}>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.email || '-'}</TableCell>
                <TableCell>{employee.position || '-'}</TableCell>
                <TableCell>
                  <EmployeeRoleSelector employee={employee} onRoleChange={handleRoleChange} />
                </TableCell>
              </TableRow>)}
          </TableBody>
        </Table>
      </CardContent>
    </Card>;
}