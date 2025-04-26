
import React from 'react';
import { MonthSelector } from '@/components/calendar/MonthSelector';

interface StatisticsHeaderProps {
  year: number;
  month: number;
  onMonthChange: (year: number, month: number) => void;
}

export const StatisticsHeader = ({ year, month, onMonthChange }: StatisticsHeaderProps) => {
  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Statistiques</h1>
      <MonthSelector 
        year={year} 
        month={month} 
        onChange={onMonthChange} 
      />
    </>
  );
};
