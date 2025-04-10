
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Employee, Project, Status } from '@/types';
import { formatDate, getMonthDays, isWeekend, isToday } from '@/lib/utils';

interface PlanningTableProps {
  employees: Employee[];
  projects: Project[];
  statuses: Status[];
  currentMonth: number;
  currentYear: number;
}

export function PlanningTable({ 
  employees, 
  projects,
  statuses, 
  currentMonth, 
  currentYear 
}: PlanningTableProps) {
  const days = getMonthDays(currentYear, currentMonth);
  
  const getStatusColor = (statusCode: string): string => {
    const status = statuses.find(s => s.code === statusCode);
    return status?.color || '#e5e7eb';
  };
  
  const getEmployeeStatus = (employeeId: string, date: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return null;
    
    return employee.schedule.find(s => s.date === date);
  };
  
  return (
    <ScrollArea className="h-[calc(100vh-300px)]">
      <div className="min-w-[800px]">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-background z-10">
            <tr className="text-muted-foreground text-xs">
              <th className="p-2 border-b font-medium text-left w-[180px]">Employé</th>
              {days.map((day) => (
                <th 
                  key={day.toISOString()} 
                  className={`p-2 border-b font-medium text-center w-[40px] ${
                    isWeekend(day) ? 'bg-muted/30' : ''
                  } ${isToday(day) ? 'bg-primary/10 text-primary' : ''}`}
                >
                  <div>{day.getDate()}</div>
                  <div className="text-[10px]">
                    {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"][day.getDay()]}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id} className="hover:bg-muted/50">
                <td className="p-2 border-b">
                  <div className="font-medium">{employee.name}</div>
                  <div className="text-xs text-muted-foreground">{employee.position || 'N/A'}</div>
                </td>
                {days.map((day) => {
                  const dateStr = formatDate(day);
                  const status = getEmployeeStatus(employee.id, dateStr);
                  const statusColor = status ? getStatusColor(status.status) : 'transparent';
                  
                  return (
                    <td 
                      key={`${employee.id}-${dateStr}`} 
                      className={`p-0 border-b text-center ${
                        isWeekend(day) ? 'bg-muted/30' : ''
                      } ${isToday(day) ? 'bg-primary/5' : ''}`}
                    >
                      <div 
                        className="h-[30px] w-full flex items-center justify-center"
                        style={{
                          backgroundColor: statusColor,
                          opacity: status ? 1 : 0.2,
                        }}
                        title={status ? 
                          `${employee.name}: ${statuses.find(s => s.code === status.status)?.label}` : 
                          'Aucun statut défini'
                        }
                      >
                        {status && (
                          <span className="text-xs font-medium text-white">
                            {status.status.substring(0, 1).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ScrollArea>
  );
}
