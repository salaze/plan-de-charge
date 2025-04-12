
import React from 'react';
import { MonthNavigator } from './toolbar/MonthNavigator';
import { ToolbarActions } from './toolbar/ToolbarActions';

interface PlanningToolbarProps {
  year: number;
  month: number;
  onMonthChange: (year: number, month: number) => void;
  onShowLegend: () => void;
}

export function PlanningToolbar({
  year,
  month,
  onMonthChange,
  onShowLegend
}: PlanningToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <MonthNavigator 
        year={year} 
        month={month} 
        onMonthChange={onMonthChange} 
      />
      
      <ToolbarActions 
        onShowLegend={onShowLegend}
      />
    </div>
  );
}
