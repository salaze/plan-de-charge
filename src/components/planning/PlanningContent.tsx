
import React, { useMemo } from 'react';
import { PlanningGrid } from '@/components/calendar/PlanningGrid';
import { Skeleton } from '@/components/ui/skeleton';

interface PlanningContentProps {
  loading: boolean;
  employees: any[];
  projects: any[];
  year: number;
  month: number;
  isAdmin: boolean;
  onStatusChange: (employeeId: string, date: string, status: any, period: any, isHighlighted?: boolean, projectCode?: string) => void;
  onStatusDialogChange: (isOpen: boolean) => void;
}

export function PlanningContent({
  loading,
  employees,
  projects,
  year,
  month,
  isAdmin,
  onStatusChange,
  onStatusDialogChange
}: PlanningContentProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  // Memoize the planning grid to prevent unnecessary re-renders
  const memoizedPlanningGrid = useMemo(() => (
    <PlanningGrid 
      year={year} 
      month={month} 
      employees={employees || []}
      projects={projects || []}
      onStatusChange={onStatusChange}
      isAdmin={isAdmin}
      onStatusDialogChange={onStatusDialogChange}
    />
  ), [year, month, employees, projects, onStatusChange, isAdmin, onStatusDialogChange]);

  return (
    <div className="overflow-auto h-[calc(100vh-220px)]">
      <div className="min-w-max pr-4 pb-8">
        {memoizedPlanningGrid}
      </div>
    </div>
  );
}
