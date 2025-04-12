
import React from 'react';
import { StatusCode, DayPeriod } from '@/types';
import { PlanningCell } from './PlanningCell';
import { formatDate } from '@/utils';

interface EmployeeDayCellProps {
  employeeId: string;
  day: Date;
  findStatusForDay: (date: string, period: DayPeriod) => {
    status: StatusCode;
    isHighlighted?: boolean;
    projectCode?: string;
  };
  onCellClick: (employeeId: string, date: string, period: DayPeriod) => void;
}

export function EmployeeDayCell({
  employeeId,
  day,
  findStatusForDay,
  onCellClick
}: EmployeeDayCellProps) {
  const formattedDate = formatDate(day);
  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
  
  // Morning status (AM)
  const morningStatus = findStatusForDay(formattedDate, 'AM');
  
  // Afternoon status (PM)
  const afternoonStatus = findStatusForDay(formattedDate, 'PM');
  
  return (
    <React.Fragment>
      {/* Morning cell */}
      <PlanningCell 
        day={day}
        employeeId={employeeId}
        period="AM"
        status={morningStatus.status}
        isHighlighted={morningStatus.isHighlighted}
        projectCode={morningStatus.projectCode}
        isWeekend={isWeekend}
        onCellClick={onCellClick}
      />
      
      {/* Afternoon cell */}
      <PlanningCell 
        day={day}
        employeeId={employeeId}
        period="PM"
        status={afternoonStatus.status}
        isHighlighted={afternoonStatus.isHighlighted}
        projectCode={afternoonStatus.projectCode}
        isWeekend={isWeekend}
        onCellClick={onCellClick}
      />
    </React.Fragment>
  );
}
