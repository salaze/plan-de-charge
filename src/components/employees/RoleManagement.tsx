
import React from 'react';
import { toast } from 'sonner';
import { Employee, UserRole } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmployeeRoleSelector } from './EmployeeRoleSelector';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseEmployees } from '@/hooks/useSupabaseEmployees';

interface RoleManagementProps {
  employees: Employee[];
  onEmployeesChange: (updatedEmployees: Employee[]) => void;
}

export function RoleManagement({
  employees,
  onEmployeesChange
}: RoleManagementProps) {
  const { updateUserRoles } = useAuth();
  const { updateEmployee } = useSupabaseEmployees();
  
  const handleRoleChange = async (employeeId: string, newRole: UserRole) => {
    try {
      // Mettre à jour le rôle dans le contexte d'authentification
      updateUserRoles(employeeId, newRole);

      // Mettre à jour le rôle dans Supabase
      await updateEmployee(employeeId, { role: newRole });

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
      
      toast.success(`Rôle mis à jour avec succès`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
      toast.error('Impossible de mettre à jour le rôle');
    }
  };
  
  return <Card>
      <CardHeader>
        <CardTitle>Gestion des rôles</CardTitle>
        <CardDescription>
          Attribuez des rôles d'administrateur ou d'employé à votre équipe
        </CardDescription>
      </CardHeader>
      <CardContent>
        {employees.length === 0 ? (
          <div className="text-center p-6 text-muted-foreground">
            Aucun employé trouvé. Veuillez d'abord créer des employés.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Identifiant</TableHead>
                <TableHead>Poste</TableHead>
                <TableHead>Rôle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map(employee => <TableRow key={employee.id}>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.uid || '-'}</TableCell>
                  <TableCell>{employee.position || '-'}</TableCell>
                  <TableCell>
                    <EmployeeRoleSelector employee={employee} onRoleChange={handleRoleChange} />
                  </TableCell>
                </TableRow>)}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>;
}
