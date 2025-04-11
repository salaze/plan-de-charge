
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FilterOptions, StatusCode } from '@/types';
import { EmployeeFilterSelect } from './filters/EmployeeFilterSelect';
import { ProjectFilterSelect } from './filters/ProjectFilterSelect';
import { DateRangeFilter } from './filters/DateRangeFilter';
import { StatusFilterGroup } from './filters/StatusFilterGroup';
import { FilterActions } from './filters/FilterActions';

interface PlanningFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  employees: { id: string; name: string }[];
  projects: { id: string; code: string; name: string; color: string }[];
  filters: FilterOptions;
  onApplyFilters: (filters: FilterOptions) => void;
  isAdmin: boolean;
}

export function PlanningFilters({
  isOpen,
  onClose,
  employees,
  projects,
  filters,
  onApplyFilters,
  isAdmin
}: PlanningFiltersProps) {
  // État local des filtres (copie pour modifier sans impact direct)
  const [localFilters, setLocalFilters] = useState<FilterOptions>({
    ...filters
  });

  // Gérer la sélection des statuts
  const handleStatusToggle = (status: StatusCode) => {
    setLocalFilters(prev => {
      const currentStatuses = prev.statusCodes || [];
      if (currentStatuses.includes(status)) {
        return {
          ...prev,
          statusCodes: currentStatuses.filter(s => s !== status)
        };
      } else {
        return {
          ...prev,
          statusCodes: [...currentStatuses, status]
        };
      }
    });
  };

  // Réinitialiser les filtres
  const handleReset = () => {
    setLocalFilters({});
  };

  // Appliquer les filtres et fermer le dialogue
  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  // Gérer les modifications d'employé
  const handleEmployeeChange = (employeeId: string | undefined) => {
    setLocalFilters(prev => ({ ...prev, employeeId }));
  };

  // Gérer les modifications de projet
  const handleProjectChange = (projectCode: string | undefined) => {
    setLocalFilters(prev => ({ ...prev, projectCode }));
  };

  // Gérer les modifications de dates
  const handleStartDateChange = (date: Date | undefined) => {
    setLocalFilters(prev => ({ ...prev, startDate: date }));
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setLocalFilters(prev => ({ ...prev, endDate: date }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filtrer le planning</DialogTitle>
          <DialogDescription>
            Définissez des filtres pour afficher uniquement certaines données du planning
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Filtre par employé - visible uniquement pour les admins */}
          {isAdmin && (
            <EmployeeFilterSelect 
              employees={employees} 
              selectedEmployeeId={localFilters.employeeId} 
              onChange={handleEmployeeChange}
            />
          )}

          {/* Filtre par projet */}
          <ProjectFilterSelect 
            projects={projects} 
            selectedProjectCode={localFilters.projectCode} 
            onChange={handleProjectChange}
          />

          {/* Filtre par période */}
          <DateRangeFilter 
            startDate={localFilters.startDate}
            endDate={localFilters.endDate}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
          />

          {/* Filtre par statut */}
          <StatusFilterGroup 
            selectedStatuses={localFilters.statusCodes || []}
            onStatusToggle={handleStatusToggle}
          />
        </div>

        <FilterActions 
          onReset={handleReset}
          onCancel={onClose}
          onApply={handleApply}
        />
      </DialogContent>
    </Dialog>
  );
}
