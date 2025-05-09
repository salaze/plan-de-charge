
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
  // Always render loading skeleton or the content, never conditionally
  const content = useMemo(() => {
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
    
    return (
      <PlanningGrid 
        year={year} 
        month={month} 
        employees={employees || []}
        projects={projects || []}
        onStatusChange={onStatusChange}
        isAdmin={isAdmin}
        onStatusDialogChange={onStatusDialogChange}
      />
    );
  }, [loading, year, month, employees, projects, onStatusChange, isAdmin, onStatusDialogChange]);

  return (
    <div className="overflow-auto h-full flex-1">
      <div className="min-w-max pr-4 pb-8">
        {content}
      </div>
    </div>
  );
}
