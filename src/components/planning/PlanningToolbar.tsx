
import React from 'react';
import { MonthNavigator } from './toolbar/MonthNavigator';
import { ToolbarActions } from './toolbar/ToolbarActions';
import { PlanningFilters } from './PlanningFilters';
import { FilterOptions } from '@/types';

interface PlanningToolbarProps {
  year: number;
  month: number;
  isAdmin: boolean;
  employees: { id: string; name: string }[];
  projects: { id: string; code: string; name: string; color: string }[];
  filters: FilterOptions;
  onMonthChange: (year: number, month: number) => void;
  onShowLegend: () => void;
  onFiltersChange: (filters: FilterOptions) => void;
}

export function PlanningToolbar({
  year,
  month,
  isAdmin,
  employees,
  projects,
  filters,
  onMonthChange,
  onShowLegend,
  onFiltersChange
}: PlanningToolbarProps) {
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);
  
  // Déterminer si des filtres sont actifs
  const hasActiveFilters = React.useMemo(() => {
    return Boolean(
      filters.employeeId || 
      filters.projectCode || 
      filters.statusCodes?.length || 
      filters.startDate || 
      filters.endDate
    );
  }, [filters]);

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <MonthNavigator 
        year={year} 
        month={month} 
        onMonthChange={onMonthChange} 
      />
      
      <ToolbarActions 
        hasActiveFilters={hasActiveFilters}
        onShowLegend={onShowLegend}
        onShowFilters={() => setIsFiltersOpen(true)}
      />
      
      <PlanningFilters
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        employees={employees}
        projects={projects}
        filters={filters}
        onApplyFilters={onFiltersChange}
        isAdmin={isAdmin}
      />
    </div>
  );
}
