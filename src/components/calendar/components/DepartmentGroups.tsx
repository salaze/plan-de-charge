
import React from 'react';
import { TableBody } from '@/components/ui/table';
import { DepartmentHeader } from './DepartmentHeader';
import { EmployeeRow } from './EmployeeRow';
import { Employee, DayPeriod } from '@/types';
import { isValidUuid } from '@/utils/idUtils';

interface DepartmentGroupsProps {
  departmentGroups: {
    name: string;
    employees: Employee[];
  }[];
  visibleDays: Date[];
  getTotalStats: (employee: Employee) => number;
  handleCellClick: (employeeId: string, date: string, period: DayPeriod) => void;
}

export function DepartmentGroups({ departmentGroups, visibleDays, getTotalStats, handleCellClick }: DepartmentGroupsProps) {
  return (
    <TableBody>
      {departmentGroups.map((group, groupIndex) => (
        <React.Fragment key={`dept-${groupIndex}`}>
          {/* Department header */}
          <DepartmentHeader 
            name={group.name} 
            colSpan={visibleDays.length * 2 + 2} 
          />
          
          {/* Employee rows */}
          {group.employees.map((employee) => {
            // Skip employees without valid IDs
            if (!isValidUuid(employee.id)) {
              console.warn(`Employé ignoré avec ID invalide: ${employee.id}`);
              return null;
            }
            
            const totalStats = getTotalStats(employee);
            
            return (
              <EmployeeRow
                key={employee.id}
                employee={employee}
                visibleDays={visibleDays}
                totalStats={totalStats}
                onCellClick={handleCellClick}
              />
            );
          })}
        </React.Fragment>
      ))}
    </TableBody>
  );
}
