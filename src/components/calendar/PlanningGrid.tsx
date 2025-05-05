
import React from 'react';
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
  
  // Generate all days in the month
  const days = generateDaysInMonth(safeYear, safeMonth);
  
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
  
  // Calculate statistics for an employee
  const getTotalStats = (employee: Employee) => {
    const stats = calculateEmployeeStats(employee, safeYear, safeMonth);
    return stats.presentDays;
  };
  
  // Log pour vérifier le nombre d'employés reçus par le composant
  console.log(`PlanningGrid a reçu ${employees.length} employés à afficher`);
  
  // If no employees, show a message
  if (!employees || employees.length === 0) {
    return (
      <div className="text-center p-8 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground">Aucun employé disponible</p>
      </div>
    );
  }
  
  // Group employees by department
  const departmentGroups = groupEmployeesByDepartment(employees);
  console.log(`Groupes de départements créés: ${departmentGroups.length}`);
  
  return (
    <>
      <div className="w-full">
        <Table className="border rounded-lg bg-white dark:bg-gray-900 shadow-sm w-full">
          <PlanningGridHeader days={days} />
          
          <TableBody>
            {departmentGroups.map((group, groupIndex) => (
              <React.Fragment key={`dept-${groupIndex}`}>
                {/* Department header */}
                <DepartmentHeader 
                  name={group.name} 
                  colSpan={days.length * 2 + 2} 
                />
                
                {/* Log employees count outside of JSX using a self-executing function */}
                {(() => {
                  console.log(`Département ${group.name}: ${group.employees.length} employés`);
                  return null; // Explicitly return null to satisfy React's requirement for a React node
                })()}
                
                {/* Employee rows */}
                {group.employees.map((employee) => {
                  const totalStats = getTotalStats(employee);
                  
                  return (
                    <EmployeeRow
                      key={employee.id}
                      employee={employee}
                      visibleDays={days}
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
