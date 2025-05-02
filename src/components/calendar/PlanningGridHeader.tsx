
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
  // Since isWeekendOrHoliday is now async, we need a non-async version for the UI
  const isWeekendDay = (day: Date) => {
    return day.getDay() === 0 || day.getDay() === 6;
  };

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
            className={`text-center whitespace-nowrap min-w-[120px] ${isWeekendDay(day) ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
          >
            <div className="calendar-day text-xs sm:text-sm">{getDayName(day, true)}</div>
            <div className="calendar-date text-xs sm:text-sm">{day.getDate()}</div>
          </TableHead>
        ))}
        <TableHead className="text-center min-w-[60px] sm:min-w-[100px] sticky right-0 bg-secondary z-20">Total</TableHead>
      </TableRow>
      <TableRow className="hover:bg-secondary">
        <TableHead className="sticky left-0 bg-secondary z-20"></TableHead>
        {days.map((day, index) => (
          <React.Fragment key={`header-${index}`}>
            <TableHead 
              className={`text-center w-[60px] text-xs sm:w-[70px] ${isWeekendDay(day) ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
            >
              AM
            </TableHead>
            <TableHead 
              className={`text-center w-[60px] text-xs sm:w-[70px] ${isWeekendDay(day) ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
            >
              PM
            </TableHead>
          </React.Fragment>
        ))}
        <TableHead className="sticky right-0 bg-secondary z-20"></TableHead>
      </TableRow>
    </TableHeader>
  );
}
