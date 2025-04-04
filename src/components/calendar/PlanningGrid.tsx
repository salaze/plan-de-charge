
import React, { useState } from 'react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  generateDaysInMonth, 
  getDayName, 
  getEmployeeStatusForDate, 
  formatDate,
  calculateEmployeeStats
} from '@/utils';
import { isWeekendOrHoliday } from '@/utils/holidayUtils';
import { StatusSelectorEnhanced } from './StatusSelectorEnhanced';
import { StatusCell } from './StatusCell';
import { Employee, DayPeriod, StatusCode } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  const [selectedCell, setSelectedCell] = useState<{
    employeeId: string;
    date: string;
    currentStatus: StatusCode;
    isHighlighted?: boolean;
    projectCode?: string;
  } | null>(null);
  
  const [selectedPeriod, setSelectedPeriod] = useState<DayPeriod>('AM');
  
  // Vérifier que year et month sont valides
  const safeYear = Number.isFinite(year) ? year : new Date().getFullYear();
  const safeMonth = Number.isFinite(month) ? month : new Date().getMonth();
  
  const days = generateDaysInMonth(safeYear, safeMonth);
  
  const handleCellClick = (employeeId: string, date: string, period: DayPeriod) => {
    if (!isAdmin) {
      toast.info("Mode lecture seule. Connexion administrateur requise pour modifier.");
      return;
    }
    
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;
    
    const dayEntry = employee.schedule.find(
      (day) => day.date === date && day.period === period
    );
    
    setSelectedCell({
      employeeId,
      date,
      currentStatus: dayEntry?.status || '',
      isHighlighted: dayEntry?.isHighlighted,
      projectCode: dayEntry?.projectCode
    });
    
    setSelectedPeriod(period);
  };
  
  const handleStatusChange = (status: StatusCode, isHighlighted?: boolean, projectCode?: string) => {
    if (!selectedCell) return;
    
    onStatusChange(
      selectedCell.employeeId,
      selectedCell.date,
      status,
      selectedPeriod,
      isHighlighted,
      projectCode
    );
    
    setSelectedCell(null);
  };
  
  const handleCloseDialog = () => {
    setSelectedCell(null);
    setSelectedPeriod('AM');
  };
  
  // Fonction pour obtenir les détails d'un statut pour une date et période
  const getDayStatus = (employee: Employee, date: string, period: DayPeriod) => {
    const dayEntry = employee.schedule.find(
      (day) => day.date === date && day.period === period
    );
    
    return {
      status: dayEntry?.status || ('' as StatusCode),
      isHighlighted: dayEntry?.isHighlighted || false,
      projectCode: dayEntry?.projectCode
    };
  };
  
  // Calculer les statistiques totales pour un employé
  const getTotalStats = (employee: Employee) => {
    const stats = calculateEmployeeStats(employee, safeYear, safeMonth);
    return stats.presentDays;
  };
  
  // Obtenir le mois visible en tenant compte du nombre de colonnes sur mobile
  const getVisibleDays = () => {
    if (isMobile) {
      // Sur mobile, prendre les 4 premiers jours ou tous si moins de 4
      const today = new Date();
      if (today.getFullYear() === safeYear && today.getMonth() === safeMonth) {
        // Si c'est le mois actuel, commencer par la date actuelle
        const currentDay = today.getDate() - 1; // 0-indexed
        return days.slice(Math.max(0, Math.min(currentDay, days.length - 4)), Math.max(4, Math.min(currentDay + 4, days.length)));
      }
      return days.slice(0, Math.min(4, days.length));
    }
    return days;
  };
  
  const visibleDays = getVisibleDays();
  
  // Si pas d'employés, afficher un message
  if (!employees || employees.length === 0) {
    return (
      <div className="text-center p-8 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground">Aucun employé disponible</p>
      </div>
    );
  }
  
  // Grouper les employés par département
  const groupEmployeesByDepartment = () => {
    const departments: { [key: string]: Employee[] } = {};
    
    employees.forEach(employee => {
      const department = employee.department || 'Sans département';
      if (!departments[department]) {
        departments[department] = [];
      }
      departments[department].push(employee);
    });
    
    // Convertir l'objet en tableau pour faciliter le rendu
    return Object.entries(departments).map(([name, employees]) => ({
      name,
      employees
    }));
  };
  
  const departmentGroups = groupEmployeesByDepartment();
  
  return (
    <>
      <div className="overflow-x-auto -mx-2 sm:mx-0">
        <Table className="border rounded-lg bg-white dark:bg-gray-900 shadow-sm min-w-full">
          <TableHeader className="bg-secondary sticky top-0 z-10">
            <TableRow className="hover:bg-secondary">
              <TableHead className="sticky left-0 bg-secondary z-20 min-w-[200px] lg:min-w-[300px]">Employé / Département / Fonction</TableHead>
              {visibleDays.map((day, index) => (
                <TableHead 
                  key={index}
                  colSpan={2}
                  className={`text-center min-w-[120px] ${isWeekendOrHoliday(day) ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                >
                  <div className="calendar-day text-xs sm:text-sm">{getDayName(day, true)}</div>
                  <div className="calendar-date text-xs sm:text-sm">{day.getDate()}</div>
                </TableHead>
              ))}
              <TableHead className="text-center min-w-[60px] sm:min-w-[100px]">Total</TableHead>
            </TableRow>
            <TableRow className="hover:bg-secondary">
              <TableHead className="sticky left-0 bg-secondary z-20"></TableHead>
              {visibleDays.map((day, index) => {
                return (
                  <React.Fragment key={`header-${index}`}>
                    <TableHead 
                      className={`text-center w-[60px] text-xs sm:w-[70px] ${isWeekendOrHoliday(day) ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                    >
                      AM
                    </TableHead>
                    <TableHead 
                      className={`text-center w-[60px] text-xs sm:w-[70px] ${isWeekendOrHoliday(day) ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                    >
                      PM
                    </TableHead>
                  </React.Fragment>
                );
              })}
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departmentGroups.map((group, groupIndex) => (
              <React.Fragment key={`dept-${groupIndex}`}>
                {/* Ligne de titre du département */}
                <TableRow className="bg-muted/50 border-t-2 border-b-2 border-primary">
                  <TableCell 
                    colSpan={visibleDays.length * 2 + 2} 
                    className="sticky left-0 bg-muted/50 font-bold text-sm py-1"
                  >
                    Département: {group.name}
                  </TableCell>
                </TableRow>
                
                {/* Employés du département */}
                {group.employees.map((employee) => {
                  const totalStats = getTotalStats(employee);
                  
                  return (
                    <TableRow 
                      key={employee.id} 
                      className="hover:bg-secondary/30 transition-colors duration-200"
                    >
                      <TableCell className="font-medium sticky left-0 bg-background z-10 text-xs sm:text-sm">
                        <div className="flex flex-col">
                          <span>{employee.name}</span>
                          <div className="space-y-0.5">
                            {employee.department && (
                              <span className="text-xs text-muted-foreground">Dpt: {employee.department}</span>
                            )}
                            {employee.position && (
                              <span className="text-xs text-muted-foreground">Fonction: {employee.position}</span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      
                      {visibleDays.map((day, index) => {
                        const date = formatDate(day);
                        const amStatus = getDayStatus(employee, date, 'AM');
                        const pmStatus = getDayStatus(employee, date, 'PM');
                        const isWeekendOrHol = isWeekendOrHoliday(day);
                        
                        return (
                          <React.Fragment key={`employee-${employee.id}-day-${index}`}>
                            <TableCell 
                              className={`text-center p-0 sm:p-1 ${isWeekendOrHol ? 'bg-gray-200 dark:bg-gray-700/50' : ''}`}
                            >
                              <div 
                                className="cursor-pointer hover:bg-secondary/50 rounded p-0.5 sm:p-1 transition-all text-xs"
                                onClick={() => handleCellClick(employee.id, date, 'AM')}
                              >
                                {amStatus.status ? (
                                  <StatusCell 
                                    status={amStatus.status} 
                                    isHighlighted={amStatus.isHighlighted}
                                    projectCode={amStatus.projectCode}
                                  />
                                ) : (
                                  <span className="inline-block w-full py-1 text-muted-foreground">-</span>
                                )}
                              </div>
                            </TableCell>
                            
                            <TableCell 
                              className={`text-center p-0 sm:p-1 ${isWeekendOrHol ? 'bg-gray-200 dark:bg-gray-700/50' : ''}`}
                            >
                              <div 
                                className="cursor-pointer hover:bg-secondary/50 rounded p-0.5 sm:p-1 transition-all text-xs"
                                onClick={() => handleCellClick(employee.id, date, 'PM')}
                              >
                                {pmStatus.status ? (
                                  <StatusCell 
                                    status={pmStatus.status} 
                                    isHighlighted={pmStatus.isHighlighted}
                                    projectCode={pmStatus.projectCode}
                                  />
                                ) : (
                                  <span className="inline-block w-full py-1 text-muted-foreground">-</span>
                                )}
                              </div>
                            </TableCell>
                          </React.Fragment>
                        );
                      })}
                      
                      <TableCell className="text-center font-medium text-xs sm:text-sm">
                        {totalStats.toFixed(1)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={!!selectedCell} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[425px] max-w-[90vw]">
          <DialogHeader>
            <DialogTitle>
              Modifier le statut {selectedPeriod === 'AM' ? '(Matin)' : '(Après-midi)'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedCell && (
            <div className="grid gap-4 py-4">
              <div className="flex space-x-2">
                <Button 
                  variant={selectedPeriod === 'AM' ? "default" : "outline"} 
                  onClick={() => setSelectedPeriod('AM')}
                  className="flex-1"
                >
                  Matin
                </Button>
                <Button 
                  variant={selectedPeriod === 'PM' ? "default" : "outline"} 
                  onClick={() => setSelectedPeriod('PM')}
                  className="flex-1"
                >
                  Après-midi
                </Button>
              </div>
              
              <StatusSelectorEnhanced 
                value={selectedCell.currentStatus}
                onChange={handleStatusChange}
                projects={projects}
                isHighlighted={selectedCell.isHighlighted}
                projectCode={selectedCell.projectCode}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
