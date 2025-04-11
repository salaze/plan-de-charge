
import React from 'react';
import { MonthSelector } from '@/components/calendar/MonthSelector';

interface MonthNavigatorProps {
  year: number;
  month: number;
  onMonthChange: (year: number, month: number) => void;
}

export function MonthNavigator({ year, month, onMonthChange }: MonthNavigatorProps) {
  return (
    <MonthSelector 
      year={year} 
      month={month} 
      onChange={onMonthChange} 
    />
  );
}
