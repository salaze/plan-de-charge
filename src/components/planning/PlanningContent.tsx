
import React, { useMemo, Suspense, lazy } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

// Lazy load la grille pour améliorer les performances du premier affichage
const PlanningGrid = lazy(() => import('@/components/calendar/PlanningGrid').then(module => ({ default: module.PlanningGrid })));

interface PlanningContentProps {
  loading: boolean;
  loadingSchedules?: boolean;
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
  loadingSchedules,
  employees,
  projects,
  year,
  month,
  isAdmin,
  onStatusChange,
  onStatusDialogChange
}: PlanningContentProps) {
  // Optimiser le rendu avec useMemo
  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="space-y-4 animate-pulse">
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
      <div className="relative">
        {loadingSchedules && (
          <div className="absolute top-2 right-2 bg-background/80 rounded-full px-3 py-1.5 flex items-center gap-2 z-10 shadow-sm border text-xs">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Chargement des plannings...</span>
          </div>
        )}
        <Suspense fallback={
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Préparation de la grille de planning...</span>
          </div>
        }>
          <PlanningGrid 
            year={year} 
            month={month} 
            employees={employees || []}
            projects={projects || []}
            onStatusChange={onStatusChange}
            isAdmin={isAdmin}
            onStatusDialogChange={onStatusDialogChange}
          />
        </Suspense>
      </div>
    );
  }, [loading, loadingSchedules, year, month, employees, projects, onStatusChange, isAdmin, onStatusDialogChange]);

  return (
    <div className="overflow-auto h-[calc(100vh-280px)]">
      <div className="min-w-max pr-4 pb-8">
        {content}
      </div>
    </div>
  );
}

export default PlanningContent;
