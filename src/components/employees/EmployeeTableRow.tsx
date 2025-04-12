
import React from 'react';
import { Pencil, Trash, Fingerprint, Briefcase, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Employee } from '@/types';
import { PasswordManager } from '@/components/employees/PasswordManager';

interface EmployeeTableRowProps {
  employee: Employee;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: string) => void;
}

export function EmployeeTableRow({ 
  employee, 
  onEditEmployee, 
  onDeleteEmployee 
}: EmployeeTableRowProps) {
  return (
    <TableRow>
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
  );
}
