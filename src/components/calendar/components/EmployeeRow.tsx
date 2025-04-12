
import React from 'react';
import { TableRow } from '@/components/ui/table';
import { Employee, StatusCode, DayPeriod } from '@/types';
import { isValidUuid } from '@/utils/idUtils';
import { EmployeeNameCell } from './EmployeeNameCell';
import { EmployeeDayCell } from './EmployeeDayCell';
import { EmployeeStatsCell } from './EmployeeStatsCell';

interface EmployeeRowProps {
  employee: Employee;
  visibleDays: Date[];
  totalStats: number;
  onCellClick: (employeeId: string, date: string, period: DayPeriod) => void;
}

export function EmployeeRow({ 
  employee, 
  visibleDays, 
  totalStats,
  onCellClick 
}: EmployeeRowProps) {
  // Validate employee ID
  if (!isValidUuid(employee.id)) {
    console.warn(`Invalid employee ID: ${employee.id}`);
    return null;
  }
  
  // Function to find the employee status for a specific date and period
  const findStatusForDay = (date: string, period: DayPeriod): {
    status: StatusCode;
    isHighlighted?: boolean;
    projectCode?: string;
  } => {
    const dayStatus = employee.schedule.find(
      (day) => day.date === date && day.period === period
    );
    
    return {
      status: dayStatus ? dayStatus.status : ('' as StatusCode),
      isHighlighted: dayStatus ? dayStatus.isHighlighted : false,
      projectCode: dayStatus ? dayStatus.projectCode : undefined
    };
  };

  return (
    <TableRow key={employee.id} className="hover:bg-muted/30 group">
      {/* Employee name cell - always visible and sticky */}
      <EmployeeNameCell name={employee.name} />
      
      {/* Display days and schedule - scrollable horizontally */}
      {visibleDays.map((day) => (
        <EmployeeDayCell 
          key={`${employee.id}-${day.toISOString().split('T')[0]}`}
          employeeId={employee.id}
          day={day}
          findStatusForDay={findStatusForDay}
          onCellClick={onCellClick}
        />
      ))}
      
      {/* Total stats for this employee */}
      <EmployeeStatsCell totalStats={totalStats} />
    </TableRow>
  );
}
