
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

    if (employees.length === 0) {
      return (
        <div className="flex items-center justify-center h-full py-12">
          <div className="text-center p-6 bg-muted/30 rounded-lg max-w-md">
            <h3 className="text-lg font-medium mb-2">Aucun employé à afficher</h3>
            <p className="text-muted-foreground">
              Aucun employé n'a été trouvé pour les critères sélectionnés. Essayez de changer de département ou de réinitialiser les filtres.
            </p>
          </div>
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
    <div className="overflow-auto h-[calc(100vh-280px)]">
      <div className="min-w-max pr-4 pb-8">
        {content}
      </div>
    </div>
  );
}
