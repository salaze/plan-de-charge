
import React from 'react';
import { User, Pencil, Trash, UserPlus, Briefcase, Building, Fingerprint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Employee } from '@/types';
import { PasswordManager } from '@/components/employees/PasswordManager';

interface EmployeeListProps {
  employees: Employee[];
  onAddEmployee: () => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: string) => void;
}

export function EmployeeList({
  employees,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee
}: EmployeeListProps) {
  const sortedEmployees = [...employees].sort((a, b) => a.name.localeCompare(b.name));
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <User className="h-5 w-5" />
          <span>Liste des employés</span>
        </h2>
        <Button onClick={onAddEmployee} size="sm" className="flex items-center gap-1">
          <UserPlus className="h-4 w-4" />
          <span>Ajouter</span>
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>UID</TableHead>
              <TableHead>Fonction</TableHead>
              <TableHead>Département</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  Aucun employé trouvé
                </TableCell>
              </TableRow>
            ) : (
              sortedEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>
                    {employee.uid ? (
                      <div className="flex items-center gap-1">
                        <Fingerprint className="h-3 w-3 text-muted-foreground" />
                        <span>{employee.uid}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm font-bold text-red-500">Non défini</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {employee.position ? (
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3 text-muted-foreground" />
                        <span>{employee.position}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {employee.department ? (
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3 text-muted-foreground" />
                        <span>{employee.department}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <PasswordManager employee={employee} />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditEmployee(employee)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteEmployee(employee.id)}
                      className="text-destructive"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
