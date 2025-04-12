
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Employee, StatusCode, DayPeriod } from '@/types';
import { PlanningStatusCell } from './PlanningStatusCell';
import { formatDate } from '@/utils';
import { isValidUuid } from '@/utils/idUtils';

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
  
  // Function to check if a date is a weekend
  const isWeekend = (date: Date) => {
    return date.getDay() === 0 || date.getDay() === 6;
  };
  
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
      <TableCell className="sticky left-0 bg-white dark:bg-gray-900 font-medium group-hover:bg-muted/30 truncate max-w-[200px]">
        {employee.name}
      </TableCell>
      
      {/* Display days and schedule - scrollable horizontally */}
      {visibleDays.map((day) => {
        const formattedDate = formatDate(day);
        const isWeekendDay = isWeekend(day);
        
        // Morning status (AM)
        const morningStatus = findStatusForDay(formattedDate, 'AM');
        
        // Afternoon status (PM)
        const afternoonStatus = findStatusForDay(formattedDate, 'PM');
        
        return (
          <React.Fragment key={`${employee.id}-${formattedDate}`}>
            {/* Morning cell */}
            <PlanningStatusCell 
              day={day}
              date={formattedDate}
              employeeId={employee.id}
              period="AM"
              status={morningStatus.status}
              isHighlighted={morningStatus.isHighlighted}
              projectCode={morningStatus.projectCode}
              isWeekend={isWeekendDay}
              onCellClick={onCellClick}
            />
            
            {/* Afternoon cell */}
            <PlanningStatusCell 
              day={day}
              date={formattedDate}
              employeeId={employee.id}
              period="PM"
              status={afternoonStatus.status}
              isHighlighted={afternoonStatus.isHighlighted}
              projectCode={afternoonStatus.projectCode}
              isWeekend={isWeekendDay}
              onCellClick={onCellClick}
            />
          </React.Fragment>
        );
      })}
      
      {/* Total stats for this employee */}
      <TableCell className="text-right font-medium sticky right-0 bg-white dark:bg-gray-900">
        {totalStats.toFixed(1)}
      </TableCell>
    </TableRow>
  );
}
