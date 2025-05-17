
import React from 'react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Employee } from '@/types';
import { EmployeeTableHeader } from './table/EmployeeTableHeader';
import { EmployeeTableRow } from './table/EmployeeTableRow';
import { EmployeeTableEmpty } from './table/EmployeeTableEmpty';
import { EmployeeTableSkeleton } from './table/EmployeeTableSkeleton';

interface EmployeeListProps {
  employees: Employee[];
  onAddEmployee: () => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: string) => void;
  loading?: boolean;
}

export function EmployeeList({
  employees,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
  loading = false
}: EmployeeListProps) {
  const sortedEmployees = [...employees].sort((a, b) => a.name.localeCompare(b.name));
  
  return (
    <div className="space-y-4">
      <EmployeeTableHeader 
        onAddEmployee={onAddEmployee}
        disabled={loading}
      />
      
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
            {loading ? (
              <EmployeeTableSkeleton />
            ) : sortedEmployees.length === 0 ? (
              <EmployeeTableEmpty />
            ) : (
              sortedEmployees.map((employee) => (
                <EmployeeTableRow
                  key={employee.id}
                  employee={employee}
                  onEdit={onEditEmployee}
                  onDelete={onDeleteEmployee}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
