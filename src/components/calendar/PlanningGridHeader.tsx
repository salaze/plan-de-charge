
import React from 'react';
import {
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { getDayName, isFrenchHoliday, getFrenchHolidayName } from '@/utils';

interface PlanningGridHeaderProps {
  days: Date[];
}

export function PlanningGridHeader({ days }: PlanningGridHeaderProps) {
  // Since isWeekendOrHoliday is now async, we need a non-async version for the UI
  const isWeekendDay = (day: Date) => {
    return day.getDay() === 0 || day.getDay() === 6;
  };
  
  // Vérifier si le jour est férié
  const isHolidayDay = (day: Date) => {
    return isFrenchHoliday(day);
  };
  
  // Obtenir le style CSS en fonction du type de jour
  const getDayStyle = (day: Date) => {
    if (isWeekendDay(day)) return 'bg-gray-200 dark:bg-gray-700';
    if (isHolidayDay(day)) return 'bg-red-100 dark:bg-red-900/30';
    return '';
  };

  return (
    <TableHeader className="bg-secondary sticky top-0 z-10">
      <TableRow className="hover:bg-secondary">
        <TableHead className="sticky left-0 bg-secondary z-20 min-w-[200px] lg:min-w-[300px]">
          Employé / Département / Fonction
        </TableHead>
        {days.map((day, index) => {
          const holidayName = getFrenchHolidayName(day);
          return (
            <TableHead 
              key={index}
              colSpan={2}
              className={`text-center whitespace-nowrap min-w-[120px] ${getDayStyle(day)}`}
            >
              <div className="calendar-day text-xs sm:text-sm">{getDayName(day, true)}</div>
              <div className="calendar-date text-xs sm:text-sm">{day.getDate()}</div>
              {holidayName && (
                <div className="text-xs text-red-600 dark:text-red-400 font-medium truncate max-w-[120px]" title={holidayName}>
                  {holidayName}
                </div>
              )}
            </TableHead>
          );
        })}
        <TableHead className="text-center min-w-[60px] sm:min-w-[100px] sticky right-0 bg-secondary z-20">Total</TableHead>
      </TableRow>
      <TableRow className="hover:bg-secondary">
        <TableHead className="sticky left-0 bg-secondary z-20"></TableHead>
        {days.map((day, index) => (
          <React.Fragment key={`header-${index}`}>
            <TableHead 
              className={`text-center w-[60px] text-xs sm:w-[70px] ${getDayStyle(day)}`}
            >
              AM
            </TableHead>
            <TableHead 
              className={`text-center w-[60px] text-xs sm:w-[70px] ${getDayStyle(day)}`}
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
