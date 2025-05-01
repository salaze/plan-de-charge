
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { PlanningToolbar } from '@/components/planning/PlanningToolbar';
import { FilterOptions } from '@/types';

interface PlanningHeaderProps {
  year: number;
  month: number;
  isAdmin: boolean;
  employees: any[];
  projects: any[];
  filters: FilterOptions;
  loading: boolean;
  isStatusDialogOpen: boolean;
  onMonthChange: (year: number, month: number) => void;
  onShowLegend: () => void;
  onFiltersChange: (filters: FilterOptions) => void;
  onRefresh: () => void;
}

export function PlanningHeader({
  year,
  month,
  isAdmin,
  employees,
  projects,
  filters,
  loading,
  isStatusDialogOpen,
  onMonthChange,
  onShowLegend,
  onFiltersChange,
  onRefresh
}: PlanningHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <PlanningToolbar 
        year={year}
        month={month}
        isAdmin={isAdmin}
        employees={employees}
        projects={projects}
        filters={filters}
        onMonthChange={onMonthChange}
        onShowLegend={onShowLegend}
        onFiltersChange={onFiltersChange}
      />
      
      <Button 
        variant="outline"
        size="sm"
        onClick={onRefresh}
        className="flex items-center gap-1"
        disabled={loading || isStatusDialogOpen}
      >
        <RefreshCw className="h-4 w-4" />
        <span>Actualiser</span>
      </Button>
    </div>
  );
}
