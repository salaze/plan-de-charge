
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { PlanningGrid } from '@/components/calendar/PlanningGrid';

interface PlanningContentProps {
  loading: boolean;
  year: number;
  month: number;
  employees: any[];
  projects: any[];
  isAdmin: boolean;
  handleStatusChange: (employeeId: string, date: string, status: any, period: any, isHighlighted?: boolean, projectCode?: string) => void;
  onStatusDialogChange: (isOpen: boolean) => void;
}

export function PlanningContent({ 
  loading, 
  year, 
  month, 
  employees, 
  projects, 
  isAdmin, 
  handleStatusChange,
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

  return (
    <div className="lg:smooth-horizontal-scroll">
      <PlanningGrid 
        year={year} 
        month={month} 
        employees={employees || []}
        projects={projects || []}
        onStatusChange={handleStatusChange}
        isAdmin={isAdmin}
        onStatusDialogChange={onStatusDialogChange}
      />
    </div>
  );
}
