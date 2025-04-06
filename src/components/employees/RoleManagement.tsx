
import React from 'react';
import { toast } from 'sonner';
import { Employee, UserRole } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmployeeRoleSelector } from './EmployeeRoleSelector';
import { useAuth } from '@/contexts/AuthContext';
import { employeeService } from '@/services/supabaseServices';

interface RoleManagementProps {
  employees: Employee[];
  onEmployeesChange: (updatedEmployees: Employee[]) => void;
}

export function RoleManagement({ employees, onEmployeesChange }: RoleManagementProps) {
  const { updateUserRoles } = useAuth();
  
  const handleRoleChange = async (employeeId: string, newRole: UserRole) => {
    try {
      // Mettre à jour le rôle dans Supabase
      const success = await employeeService.updateRole(employeeId, newRole);
      
      if (!success) {
        toast.error('Erreur lors de la mise à jour du rôle');
        return;
      }
      
      // Mettre à jour le rôle dans le contexte d'authentification
      updateUserRoles(employeeId, newRole);
      
      // Mettre à jour la liste des employés localement
      const updatedEmployees = employees.map(emp => {
        if (emp.id === employeeId) {
          return { ...emp, role: newRole };
        }
        return emp;
      });
      
      onEmployeesChange(updatedEmployees);
      toast.success('Rôle mis à jour avec succès');
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
      toast.error('Une erreur est survenue');
    }
  };
  
  return (
    <Card>
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
              <TableHead>UID</TableHead>
              <TableHead>Poste</TableHead>
              <TableHead>Rôle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map(employee => (
              <TableRow key={employee.id}>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.uid || '-'}</TableCell>
                <TableCell>{employee.position || '-'}</TableCell>
                <TableCell>
                  <EmployeeRoleSelector 
                    employee={employee} 
                    onRoleChange={handleRoleChange} 
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
