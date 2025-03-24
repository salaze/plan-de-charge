
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
  employees, 
  projects,
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
  
  const days = generateDaysInMonth(year, month);
  
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
  
  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
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
    const stats = calculateEmployeeStats(employee, year, month);
    return stats.presentDays;
  };
  
  // Obtenir le mois visible en tenant compte du nombre de colonnes sur mobile
  const getVisibleDays = () => {
    if (isMobile) {
      // Sur mobile, prendre les 7 premiers jours ou tous si moins de 7
      const today = new Date();
      if (today.getFullYear() === year && today.getMonth() === month) {
        // Si c'est le mois actuel, commencer par la date actuelle
        const currentDay = today.getDate() - 1; // 0-indexed
        return days.slice(Math.max(0, Math.min(currentDay, days.length - 7)), Math.max(7, Math.min(currentDay + 7, days.length)));
      }
      return days.slice(0, Math.min(7, days.length));
    }
    return days;
  };
  
  const visibleDays = getVisibleDays();
  
  return (
    <>
      <div className="overflow-x-auto">
        <Table className="border rounded-lg bg-white dark:bg-gray-900 shadow-sm">
          <TableHeader className="bg-secondary sticky top-0 z-10">
            <TableRow className="hover:bg-secondary">
              <TableHead className="sticky left-0 bg-secondary z-20 min-w-[200px]">Employé</TableHead>
              {visibleDays.map((day, index) => (
                <TableHead 
                  key={index}
                  colSpan={2}
                  className={`text-center min-w-[140px] ${isWeekend(day) ? 'bg-muted' : ''}`}
                >
                  <div className="calendar-day">{getDayName(day, true)}</div>
                  <div className="calendar-date">{day.getDate()}</div>
                </TableHead>
              ))}
              <TableHead className="text-center min-w-[100px]">Total</TableHead>
            </TableRow>
            <TableRow className="hover:bg-secondary">
              <TableHead className="sticky left-0 bg-secondary z-20"></TableHead>
              {visibleDays.map((day, index) => {
                return (
                  <React.Fragment key={`header-${index}`}>
                    <TableHead 
                      className={`text-center w-[70px] ${isWeekend(day) ? 'bg-muted' : ''}`}
                    >
                      AM
                    </TableHead>
                    <TableHead 
                      className={`text-center w-[70px] ${isWeekend(day) ? 'bg-muted' : ''}`}
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
            {employees.map((employee) => {
              const totalStats = getTotalStats(employee);
              
              return (
                <TableRow 
                  key={employee.id} 
                  className="hover:bg-secondary/30 transition-colors duration-200"
                >
                  <TableCell className="font-medium sticky left-0 bg-background z-10">
                    {employee.name}
                  </TableCell>
                  
                  {visibleDays.map((day, index) => {
                    const date = formatDate(day);
                    const amStatus = getDayStatus(employee, date, 'AM');
                    const pmStatus = getDayStatus(employee, date, 'PM');
                    
                    // Fix: Using a div wrapper instead of React.Fragment to fix the invalid prop issue
                    return (
                      <React.Fragment key={`employee-${employee.id}-day-${index}`}>
                        <TableCell 
                          className={`text-center p-1 ${isWeekend(day) ? 'bg-muted/50' : ''}`}
                        >
                          <div 
                            className="cursor-pointer hover:bg-secondary/50 rounded p-1 transition-all text-xs"
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
                          className={`text-center p-1 ${isWeekend(day) ? 'bg-muted/50' : ''}`}
                        >
                          <div 
                            className="cursor-pointer hover:bg-secondary/50 rounded p-1 transition-all text-xs"
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
                  
                  <TableCell className="text-center font-medium">
                    {totalStats.toFixed(1)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={!!selectedCell} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[425px]">
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
