
import React from 'react';
import {
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { isWeekendOrHoliday } from '@/utils/holidayUtils';
import { getDayName } from '@/utils';

interface PlanningGridHeaderProps {
  days: Date[];
}

export function PlanningGridHeader({ days }: PlanningGridHeaderProps) {
  return (
    <TableHeader className="bg-secondary sticky top-0 z-10">
      <TableRow className="hover:bg-secondary">
        <TableHead className="sticky left-0 bg-secondary z-20 min-w-[200px] lg:min-w-[300px]">
          Employé / Département / Fonction
        </TableHead>
        {days.map((day, index) => (
          <TableHead 
            key={index}
            colSpan={2}
            className={`text-center min-w-[120px] ${isWeekendOrHoliday(day) ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
          >
            <div className="calendar-day text-xs sm:text-sm">{getDayName(day, true)}</div>
            <div className="calendar-date text-xs sm:text-sm">{day.getDate()}</div>
          </TableHead>
        ))}
        <TableHead className="text-center min-w-[60px] sm:min-w-[100px]">Total</TableHead>
      </TableRow>
      <TableRow className="hover:bg-secondary">
        <TableHead className="sticky left-0 bg-secondary z-20"></TableHead>
        {days.map((day, index) => (
          <React.Fragment key={`header-${index}`}>
            <TableHead 
              className={`text-center w-[60px] text-xs sm:w-[70px] ${isWeekendOrHoliday(day) ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
            >
              AM
            </TableHead>
            <TableHead 
              className={`text-center w-[60px] text-xs sm:w-[70px] ${isWeekendOrHoliday(day) ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
            >
              PM
            </TableHead>
          </React.Fragment>
        ))}
        <TableHead></TableHead>
      </TableRow>
    </TableHeader>
  );
}
