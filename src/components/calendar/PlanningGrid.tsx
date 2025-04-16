
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
  
  // Handler for status changes
  const handleStatusChange = (status: StatusCode, isHighlighted?: boolean, projectCode?: string) => {
    if (!selectedCell) return;
    
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
      <StatusChangeDialog
        isOpen={!!selectedCell}
        onClose={handleCloseDialog}
        onStatusChange={handleStatusChange}
        currentStatus={selectedCell?.currentStatus || ''}
        isHighlighted={selectedCell?.isHighlighted}
        projectCode={selectedCell?.projectCode}
        projects={projects}
      />
    </>
  );
}
