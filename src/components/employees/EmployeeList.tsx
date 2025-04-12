
import React from 'react';
import { Table, TableBody } from '@/components/ui/table';
import { Employee } from '@/types';
import { EmployeeListHeader } from './EmployeeListHeader';
import { EmployeeTableHeader } from './EmployeeTableHeader';
import { EmployeeTableRow } from './EmployeeTableRow';
import { EmptyEmployeeTable } from './EmptyEmployeeTable';

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
      <EmployeeListHeader onAddEmployee={onAddEmployee} />
      
      <div className="rounded-md border">
        <Table>
          <EmployeeTableHeader />
          <TableBody>
            {sortedEmployees.length === 0 ? (
              <EmptyEmployeeTable />
            ) : (
              sortedEmployees.map(employee => (
                <EmployeeTableRow
                  key={employee.id}
                  employee={employee}
                  onEditEmployee={onEditEmployee}
                  onDeleteEmployee={onDeleteEmployee}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
