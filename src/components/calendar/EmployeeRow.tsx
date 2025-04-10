
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { formatDate, isWeekendOrHoliday } from '@/utils';
import { PlanningStatusCell } from './PlanningStatusCell';
import { Employee, DayStatus } from '@/types';

interface EmployeeRowProps {
  employee: Employee;
  visibleDays: Date[];
  totalStats: number;
  onCellClick: (employeeId: string, date: string, period: 'AM' | 'PM') => void;
}

export function EmployeeRow({ employee, visibleDays, totalStats, onCellClick }: EmployeeRowProps) {
  // Function to get status details for a date and period
  const getDayStatus = (date: string, period: 'AM' | 'PM') => {
    const dayEntry = employee.schedule.find(
      (day) => day.date === date && day.period === period
    );
    
    return {
      status: dayEntry?.status || '',
      isHighlighted: dayEntry?.isHighlighted || false,
      projectCode: dayEntry?.projectCode
    };
  };
  
  return (
    <TableRow 
      key={employee.id} 
      className="hover:bg-secondary/30 transition-colors duration-200"
    >
      <TableCell className="font-medium sticky left-0 bg-background z-10 text-xs sm:text-sm">
        <div className="flex flex-col">
          <span>{employee.name}</span>
          <div className="space-y-0.5">
            {employee.department && (
              <span className="text-xs text-muted-foreground">Dpt: {employee.department}</span>
            )}
            {employee.position && (
              <span className="text-xs text-muted-foreground">Fonction: {employee.position}</span>
            )}
          </div>
        </div>
      </TableCell>
      
      {visibleDays.map((day, index) => {
        const date = formatDate(day);
        const amStatus = getDayStatus(date, 'AM');
        const pmStatus = getDayStatus(date, 'PM');
        const isWeekendOrHol = isWeekendOrHoliday(day);
        
        return (
          <React.Fragment key={`day-${index}`}>
            <PlanningStatusCell
              day={day}
              date={date}
              employeeId={employee.id}
              period="AM"
              status={amStatus.status}
              isHighlighted={amStatus.isHighlighted}
              projectCode={amStatus.projectCode}
              isWeekend={isWeekendOrHol}
              onCellClick={onCellClick}
            />
            <PlanningStatusCell
              day={day}
              date={date}
              employeeId={employee.id}
              period="PM"
              status={pmStatus.status}
              isHighlighted={pmStatus.isHighlighted}
              projectCode={pmStatus.projectCode}
              isWeekend={isWeekendOrHol}
              onCellClick={onCellClick}
            />
          </React.Fragment>
        );
      })}
      
      <TableCell className="text-center font-medium text-xs sm:text-sm">
        {totalStats.toFixed(1)}
      </TableCell>
    </TableRow>
  );
}
