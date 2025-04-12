
import React from 'react';
import { TableCell } from '@/components/ui/table';
import { StatusCell } from '../StatusCell';
import { StatusCode, DayPeriod } from '@/types';
import { isValidUuid } from '@/utils/idUtils';

interface PlanningStatusCellProps {
  day: Date;
  date: string;
  employeeId: string;
  period: 'AM' | 'PM' | 'FULL'; // Updated to accept 'FULL' as well
  status: StatusCode;
  isHighlighted?: boolean;
  projectCode?: string;
  isWeekend: boolean;
  onCellClick: (employeeId: string, date: string, period: DayPeriod) => void;
}

export function PlanningCell({
  day,
  date,
  employeeId,
  period,
  status,
  isHighlighted,
  projectCode,
  isWeekend,
  onCellClick
}: PlanningStatusCellProps) {
  // Check if the employee ID is valid
  const isValidEmployeeId = isValidUuid(employeeId);
  
  // If the employee ID is invalid, render a disabled cell
  if (!isValidEmployeeId) {
    return (
      <TableCell 
        className={`text-center p-0 sm:p-1 ${isWeekend ? 'bg-gray-200 dark:bg-gray-700/50' : ''}`}
      >
        <div className="rounded p-0.5 sm:p-1 text-xs text-muted-foreground">
          ID invalide
        </div>
      </TableCell>
    );
  }
  
  const handleClick = () => {
    if (isValidEmployeeId) {
      // Only pass AM, PM or FULL as appropriate for DayPeriod
      onCellClick(employeeId, date, period as DayPeriod);
    }
  };
  
  return (
    <TableCell 
      className={`text-center p-0 sm:p-1 ${isWeekend ? 'bg-gray-200 dark:bg-gray-700/50' : ''}`}
    >
      <div 
        className="cursor-pointer hover:bg-secondary/50 rounded p-0.5 sm:p-1 transition-all text-xs"
        onClick={handleClick}
      >
        {status ? (
          <StatusCell 
            status={status} 
            isHighlighted={isHighlighted}
            projectCode={projectCode}
          />
        ) : (
          <span className="inline-block w-full py-1 text-muted-foreground">-</span>
        )}
      </div>
    </TableCell>
  );
}
