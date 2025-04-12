
import React, { useEffect } from 'react';
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
import { isValidUuid, ensureValidUuid } from '@/utils/idUtils';

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
}

export function PlanningGrid({ 
  year, 
  month, 
  employees = [], 
  projects = [],
  onStatusChange,
  isAdmin
}: PlanningGridProps) {
  // Extract grid functionality to a custom hook
  const {
    selectedCell,
    handleCellClick,
    handleCloseDialog,
    getVisibleDays
  } = usePlanningGrid(isAdmin);
  
  // Ensure year and month are valid
  const safeYear = Number.isFinite(year) ? year : new Date().getFullYear();
  const safeMonth = Number.isFinite(month) ? month : new Date().getMonth();
  
  // Generate all days in the month
  const days = generateDaysInMonth(safeYear, safeMonth);
  
  // Get visible days based on screen size
  const visibleDays = getVisibleDays(days, safeYear, safeMonth);
  
  // Ensure project IDs are valid
  const validatedProjects = projects.map(project => ({
    ...project,
    id: ensureValidUuid(project.id)
  }));
  
  // Log employees data for debugging
  useEffect(() => {
    console.log("PlanningGrid employees:", employees.length, employees.map(e => e.name));
  }, [employees]);
  
  // Find current status for a selected cell
  const findCurrentStatus = (employeeId: string, date: string, period: DayPeriod) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return { status: '' as StatusCode, isHighlighted: false };
    
    const dayEntry = employee.schedule.find(
      (day) => day.date === date && day.period === period
    );
    
    return {
      status: dayEntry?.status || '' as StatusCode,
      isHighlighted: dayEntry?.isHighlighted || false,
      projectCode: dayEntry?.projectCode
    };
  };
  
  // Handler for status changes
  const handleStatusChange = (status: StatusCode, isHighlighted?: boolean, projectCode?: string) => {
    if (!selectedCell) {
      console.error("Aucune cellule sélectionnée");
      return;
    }
    
    try {
      console.log("Changement de statut:", status, "pour la cellule:", selectedCell);
      
      // Validate employee ID before proceeding
      const employeeId = selectedCell.employeeId;
      if (!isValidUuid(employeeId)) {
        console.error("ID d'employé invalide:", employeeId);
        toast.error("ID d'employé invalide");
        return;
      }
      
      // Apply the change immediately
      onStatusChange(
        employeeId,
        selectedCell.date,
        status,
        selectedCell.period,
        isHighlighted,
        projectCode
      );
      
      // Close dialog
      handleCloseDialog();
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
      toast.error("Une erreur s'est produite lors de la mise à jour du statut");
    }
  };
  
  // Calculate statistics for an employee
  const getTotalStats = (employee: Employee) => {
    const stats = calculateEmployeeStats(employee, safeYear, safeMonth);
    return stats.presentDays;
  };
  
  // If no employees, show a message
  if (!employees || employees.length === 0) {
    return (
      <div className="text-center p-8 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground">Aucun employé disponible</p>
      </div>
    );
  }
  
  // Filter out employees with invalid IDs
  const validEmployees = employees.filter(emp => isValidUuid(emp.id));
  
  // Group valid employees by department
  const departmentGroups = groupEmployeesByDepartment(validEmployees);

  // Get current status details for the selected cell
  const currentStatus = selectedCell 
    ? findCurrentStatus(selectedCell.employeeId, selectedCell.date, selectedCell.period) 
    : { status: '' as StatusCode, isHighlighted: false };

  console.log("Employés sur la page de planning:", validEmployees.length);
  
  return (
    <>
      <div className="overflow-x-auto -mx-2 sm:mx-0">
        <Table className="border rounded-lg bg-white dark:bg-gray-900 shadow-sm min-w-full">
          <PlanningGridHeader days={visibleDays} />
          
          <TableBody>
            {departmentGroups.map((group, groupIndex) => (
              <React.Fragment key={`dept-${groupIndex}`}>
                {/* Department header */}
                <DepartmentHeader 
                  name={group.name} 
                  colSpan={visibleDays.length * 2 + 2} 
                />
                
                {/* Employee rows */}
                {group.employees.map((employee) => {
                  // Skip employees without valid IDs
                  if (!isValidUuid(employee.id)) {
                    console.warn(`Employé ignoré avec ID invalide: ${employee.id}`);
                    return null;
                  }
                  
                  const totalStats = getTotalStats(employee);
                  
                  return (
                    <EmployeeRow
                      key={employee.id}
                      employee={employee}
                      visibleDays={visibleDays}
                      totalStats={totalStats}
                      onCellClick={handleCellClick}
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Status change dialog */}
      {selectedCell && (
        <StatusChangeDialog
          isOpen={!!selectedCell}
          onClose={handleCloseDialog}
          onStatusChange={handleStatusChange}
          currentStatus={currentStatus.status}
          isHighlighted={currentStatus.isHighlighted}
          projectCode={currentStatus.projectCode}
          projects={validatedProjects}
        />
      )}
    </>
  );
}
