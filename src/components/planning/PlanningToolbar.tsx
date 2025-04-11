
import React from 'react';
import { Button } from '@/components/ui/button';
import { MonthSelector } from '@/components/calendar/MonthSelector';
import { Filter, Info } from 'lucide-react';
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
        
        {/* Bouton de filtres visible pour tous les utilisateurs */}
        <Button 
          variant={hasActiveFilters ? "default" : "outline"}
          className={hasActiveFilters ? "" : "transition-all hover:bg-secondary"}
          onClick={() => setIsFiltersOpen(true)}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filtres {hasActiveFilters && "(Actifs)"}
        </Button>
      </div>
      
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
