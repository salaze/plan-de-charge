
import React from 'react';
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

  // Assurer qu'on affiche bien tous les employés
  console.log(`Affichage de ${employees.length} employés dans le planning`);

  return (
    <div className="overflow-auto h-[calc(100vh-220px)]">
      <div className="min-w-max pr-4 pb-8">
        <PlanningGrid 
          year={year} 
          month={month} 
          employees={employees || []}
          projects={projects || []}
          onStatusChange={onStatusChange}
          isAdmin={isAdmin}
          onStatusDialogChange={onStatusDialogChange}
        />
      </div>
    </div>
  );
}
