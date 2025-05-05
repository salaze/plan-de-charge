
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Table,
  TableBody
} from '@/components/ui/table';
import { toast } from 'sonner';
import { 
  generateDaysInMonth, 
  formatDate,
  calculateEmployeeStats
} from '@/utils';
import { Employee, DayPeriod, StatusCode } from '@/types';
import { PlanningGridHeader } from './PlanningGridHeader';
import { EmployeeRow } from './EmployeeRow';
import { DepartmentHeader } from './DepartmentHeader';
import { StatusChangeDialog } from './StatusChangeDialog';
import { usePlanningGrid } from '@/hooks/usePlanningGrid';
import { groupEmployeesByDepartment } from '@/utils/departmentUtils';

interface PlanningGridProps {
  year: number;
  month: number;
  employees: Employee[];
  projects: { id: string; code: string; name: string; color: string }[];
  onStatusChange: (
    employeeId: string, 
    date: string, 
    status: StatusCode, 
    period: DayPeriod,
    isHighlighted?: boolean,
    projectCode?: string
  ) => void;
  isAdmin: boolean;
  onStatusDialogChange?: (isOpen: boolean) => void;
}

export function PlanningGrid({ 
  year, 
  month, 
  employees = [], 
  projects = [],
  onStatusChange,
  isAdmin,
  onStatusDialogChange
}: PlanningGridProps) {
  // État pour stocker le département sélectionné
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  
  // Extract grid functionality to a custom hook
  const {
    selectedCell,
    selectedPeriod,
    isEditing,
    handleCellClick,
    handleCloseDialog
  } = usePlanningGrid(isAdmin);
  
  // Notifier le parent quand le dialogue s'ouvre ou se ferme
  React.useEffect(() => {
    if (onStatusDialogChange) {
      onStatusDialogChange(!!selectedCell);
    }
  }, [selectedCell, onStatusDialogChange]);

  // Ensure year and month are valid
  const safeYear = Number.isFinite(year) ? year : new Date().getFullYear();
  const safeMonth = Number.isFinite(month) ? month : new Date().getMonth();
  
  // Generate all days in the month - using useMemo for performance
  const days = useMemo(() => {
    return generateDaysInMonth(safeYear, safeMonth);
  }, [safeYear, safeMonth]);
  
  // Handler for status changes
  const handleStatusChange = (status: StatusCode, isHighlighted?: boolean, projectCode?: string) => {
    if (!selectedCell) return;
    
    // Émettre un événement d'édition pour prévenir les actualisations automatiques
    window.dispatchEvent(new CustomEvent('statusEditStart'));
    
    // Apply the change immediately
    onStatusChange(
      selectedCell.employeeId,
      selectedCell.date,
      status,
      selectedCell.period,
      isHighlighted,
      projectCode
    );
    
    // Close dialog
    handleCloseDialog();
  };
  
  // Calculate statistics for an employee - memoize this function
  const getTotalStats = useMemo(() => {
    return (employee: Employee) => {
      const stats = calculateEmployeeStats(employee, safeYear, safeMonth);
      return stats.presentDays;
    };
  }, [safeYear, safeMonth]);
  
  // Group employees by department - memoize this computation
  const departmentGroups = useMemo(() => {
    return groupEmployeesByDepartment(employees);
  }, [employees]);
  
  // Filtrer les départements en fonction de la sélection - memoize this
  const filteredGroups = useMemo(() => {
    return selectedDepartment 
      ? departmentGroups.filter(group => group.name === selectedDepartment)
      : departmentGroups;
  }, [departmentGroups, selectedDepartment]);
  
  // Extraire la liste de tous les départements - memoize this
  const allDepartments = useMemo(() => {
    return departmentGroups.map(group => group.name);
  }, [departmentGroups]);
  
  // Gérer la sélection d'un département
  const handleDepartmentSelect = (department: string) => {
    if (department === selectedDepartment) {
      setSelectedDepartment(null); // Désélectionner si on clique sur le même département
      toast.info("Affichage de tous les départements");
    } else {
      setSelectedDepartment(department);
      toast.info(`Département ${department} sélectionné`);
    }
  };
  
  // Create an empty array if no employees are available
  const noContentMessage = useMemo(() => (
    <div className="text-center p-8 bg-muted/30 rounded-lg">
      <p className="text-muted-foreground">Aucun employé disponible</p>
    </div>
  ), []);
  
  // Ensure we always render the employee table or the empty message, not conditionally
  const content = useMemo(() => {
    if (!employees || employees.length === 0) {
      return noContentMessage;
    }
    
    return (
      <div className="w-full">
        <Table className="border rounded-lg bg-white dark:bg-gray-900 shadow-sm w-full">
          <PlanningGridHeader days={days} />
          
          <TableBody>
            {filteredGroups.map((group, groupIndex) => (
              <React.Fragment key={`dept-${groupIndex}`}>
                {/* Department header with dropdown */}
                <DepartmentHeader 
                  name={group.name} 
                  colSpan={days.length * 2 + 2}
                  allDepartments={allDepartments}
                  onDepartmentSelect={handleDepartmentSelect}
                />
                
                {/* Employee rows */}
                {group.employees.map((employee) => (
                  <EmployeeRow
                    key={employee.id}
                    employee={employee}
                    visibleDays={days}
                    totalStats={getTotalStats(employee)}
                    onCellClick={handleCellClick}
                  />
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }, [employees, days, filteredGroups, allDepartments, handleDepartmentSelect, getTotalStats, handleCellClick, noContentMessage]);
  
  return (
    <>
      {content}
      
      {/* Status change dialog */}
      <StatusChangeDialog
        isOpen={!!selectedCell}
        onClose={handleCloseDialog}
        onStatusChange={handleStatusChange}
        currentStatus={selectedCell?.currentStatus || ''}
        isHighlighted={selectedCell?.isHighlighted}
        projectCode={selectedCell?.projectCode}
        projects={projects}
        selectedPeriod={selectedPeriod}
      />
    </>
  );
}
