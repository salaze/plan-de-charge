
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
import { 
  generateDaysInMonth, 
  getDayName, 
  getEmployeeStatusForDate, 
  formatDate,
  calculateEmployeeStats
} from '@/utils';
import { StatusSelector } from './StatusSelector';
import { StatusCell } from './StatusCell';
import { Employee, DayPeriod, StatusCode } from '@/types';

interface PlanningGridProps {
  year: number;
  month: number;
  employees: Employee[];
  onStatusChange: (
    employeeId: string, 
    date: string, 
    status: StatusCode, 
    period: DayPeriod
  ) => void;
}

export function PlanningGrid({ 
  year, 
  month, 
  employees, 
  onStatusChange 
}: PlanningGridProps) {
  const [selectedCell, setSelectedCell] = useState<{
    employeeId: string;
    date: string;
    currentStatus: StatusCode;
  } | null>(null);
  
  const [selectedPeriod, setSelectedPeriod] = useState<DayPeriod>('AM');
  
  const days = generateDaysInMonth(year, month);
  
  const handleCellClick = (employeeId: string, date: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;
    
    const currentStatus = getEmployeeStatusForDate(employee, date, selectedPeriod);
    
    setSelectedCell({
      employeeId,
      date,
      currentStatus
    });
  };
  
  const handleStatusChange = (status: StatusCode) => {
    if (!selectedCell) return;
    
    onStatusChange(
      selectedCell.employeeId,
      selectedCell.date,
      status,
      selectedPeriod
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
  
  // Fonction pour obtenir les statuts AM et PM pour une date donnée
  const getDayPeriodStatus = (employee: Employee, date: string) => {
    return {
      AM: getEmployeeStatusForDate(employee, date, 'AM'),
      PM: getEmployeeStatusForDate(employee, date, 'PM')
    };
  };
  
  return (
    <>
      <div className="overflow-x-auto">
        <Table className="border rounded-lg bg-white dark:bg-gray-900 shadow-sm">
          <TableHeader className="bg-secondary sticky top-0 z-10">
            <TableRow className="hover:bg-secondary">
              <TableHead className="sticky left-0 bg-secondary z-20 min-w-[200px]">Employé</TableHead>
              {days.map((day, index) => (
                <TableHead 
                  key={index}
                  className={`text-center min-w-[70px] ${isWeekend(day) ? 'bg-muted' : ''}`}
                >
                  <div className="calendar-day">{getDayName(day, true)}</div>
                  <div className="calendar-date">{day.getDate()}</div>
                </TableHead>
              ))}
              <TableHead className="text-center min-w-[100px]">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => {
              const stats = calculateEmployeeStats(employee, year, month);
              
              return (
                <TableRow 
                  key={employee.id} 
                  className="hover:bg-secondary/30 transition-colors duration-200"
                >
                  <TableCell className="font-medium sticky left-0 bg-background z-10">
                    {employee.name}
                  </TableCell>
                  
                  {days.map((day, index) => {
                    const date = formatDate(day);
                    const dayStatus = getDayPeriodStatus(employee, date);
                    
                    return (
                      <TableCell 
                        key={index} 
                        className={`text-center p-1 ${isWeekend(day) ? 'bg-muted/50' : ''}`}
                      >
                        <div className="flex flex-col gap-1">
                          <div 
                            className="cursor-pointer hover:bg-secondary/50 rounded p-1 transition-all text-xs"
                            onClick={() => {
                              setSelectedPeriod('AM');
                              handleCellClick(employee.id, date);
                            }}
                          >
                            <div className="text-xs font-medium text-muted-foreground">AM</div>
                            {dayStatus.AM ? (
                              <StatusCell status={dayStatus.AM} />
                            ) : (
                              <span className="inline-block w-full py-1 text-muted-foreground">-</span>
                            )}
                          </div>
                          
                          <div 
                            className="cursor-pointer hover:bg-secondary/50 rounded p-1 transition-all text-xs"
                            onClick={() => {
                              setSelectedPeriod('PM');
                              handleCellClick(employee.id, date);
                            }}
                          >
                            <div className="text-xs font-medium text-muted-foreground">PM</div>
                            {dayStatus.PM ? (
                              <StatusCell status={dayStatus.PM} />
                            ) : (
                              <span className="inline-block w-full py-1 text-muted-foreground">-</span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    );
                  })}
                  
                  <TableCell className="text-center font-medium">
                    {stats.presentDays.toFixed(1)}
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
              
              <StatusSelector 
                value={selectedCell.currentStatus} 
                onChange={handleStatusChange} 
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
