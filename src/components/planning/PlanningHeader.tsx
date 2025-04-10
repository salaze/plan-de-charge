
import React from 'react';
import { Link } from 'react-router-dom';
import { MonthSelector } from '@/components/calendar/MonthSelector';

interface PlanningHeaderProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
  year: number;
  month: number;
  onMonthChange: (year: number, month: number) => void;
}

export function PlanningHeader({
  isAuthenticated,
  isAdmin,
  year,
  month,
  onMonthChange
}: PlanningHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
      <h1 className="text-2xl font-bold">Planning</h1>
      <div className="flex items-center gap-2">
        {!isAuthenticated && (
          <Link to="/login" className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-2 rounded-md text-sm">
            Se connecter
          </Link>
        )}
        {isAdmin && (
          <Link to="/init" className="text-sm text-muted-foreground hover:text-primary">
            Initialisation/Migration
          </Link>
        )}
        <MonthSelector 
          year={year} 
          month={month} 
          onChange={onMonthChange}
        />
      </div>
    </div>
  );
}
