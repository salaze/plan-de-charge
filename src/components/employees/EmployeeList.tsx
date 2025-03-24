
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Plus, Edit, Trash, Mail } from 'lucide-react';
import { Employee } from '@/types';

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
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Liste des employés</h2>
        <Button onClick={onAddEmployee} className="transition-transform hover:scale-105">
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un employé
        </Button>
      </div>
      
      <div className="glass-panel overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Poste</TableHead>
              <TableHead>Département</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Aucun employé dans la liste
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.id} className="hover:bg-secondary">
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>
                    {employee.email ? (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span>{employee.email}</span>
                      </div>
                    ) : '-'}
                  </TableCell>
                  <TableCell>{employee.position || '-'}</TableCell>
                  <TableCell>{employee.department || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onEditEmployee(employee)}
                        className="transition-transform hover:scale-105"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onDeleteEmployee(employee.id)}
                        className="text-destructive transition-transform hover:scale-105"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
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
