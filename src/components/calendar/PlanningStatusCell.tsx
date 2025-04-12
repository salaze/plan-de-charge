
import React from 'react';
import { TableCell } from '@/components/ui/table';
import { StatusCell } from './StatusCell';
import { StatusCode } from '@/types';
import { isWeekendOrHoliday } from '@/utils/holidayUtils';
import { ensureValidUuid } from '@/utils/idUtils';

interface PlanningStatusCellProps {
  day: Date;
  date: string;
  employeeId: string;
  period: 'AM' | 'PM';
  status: StatusCode;
  isHighlighted?: boolean;
  projectCode?: string;
  isWeekend: boolean;
  onCellClick: (employeeId: string, date: string, period: 'AM' | 'PM') => void;
}

export function PlanningStatusCell({
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
  // Ensure the employee ID is a valid UUID
  const validEmployeeId = ensureValidUuid(employeeId);
  
  return (
    <TableCell 
      className={`text-center p-0 sm:p-1 ${isWeekend ? 'bg-gray-200 dark:bg-gray-700/50' : ''}`}
    >
      <div 
        className="cursor-pointer hover:bg-secondary/50 rounded p-0.5 sm:p-1 transition-all text-xs"
        onClick={() => onCellClick(validEmployeeId, date, period)}
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
