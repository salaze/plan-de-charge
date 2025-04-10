
import React from 'react';
import { Button } from '@/components/ui/button';
import { MonthSelector } from '@/components/calendar/MonthSelector';
import { Filter, Info } from 'lucide-react';

interface PlanningToolbarProps {
  year: number;
  month: number;
  isAdmin: boolean;
  onMonthChange: (year: number, month: number) => void;
  onShowLegend: () => void;
}

export function PlanningToolbar({
  year,
  month,
  isAdmin,
  onMonthChange,
  onShowLegend
}: PlanningToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <MonthSelector 
        year={year} 
        month={month} 
        onChange={onMonthChange} 
      />
      
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          onClick={onShowLegend}
          className="transition-all hover:bg-secondary"
        >
          <Info className="mr-2 h-4 w-4" />
          Légende
        </Button>
        
        {isAdmin && (
          <Button variant="outline" className="transition-all hover:bg-secondary">
            <Filter className="mr-2 h-4 w-4" />
            Filtres
          </Button>
        )}
      </div>
    </div>
  );
}
