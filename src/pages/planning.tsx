
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from 'lucide-react';
import { storageService } from '@/services/storage';
import { Employee, Project, Status, DateRange } from '@/types';
import { formatDate, getMonthDays, isWeekend, isToday } from '@/lib/utils';

export default function Planning() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const employees = await storageService.getEmployees();
        const projects = await storageService.getProjects();
        const statuses = await storageService.getStatuses();
        
        setEmployees(employees);
        setProjects(projects);
        setStatuses(statuses);
      } catch (error) {
        console.error('Error loading planning data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const days = getMonthDays(currentYear, currentMonth);
  
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };
  
  const getStatusColor = (statusCode: string): string => {
    const status = statuses.find(s => s.code === statusCode);
    return status?.color || '#e5e7eb';
  };
  
  const getEmployeeStatus = (employeeId: string, date: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return null;
    
    return employee.schedule.find(s => s.date === date);
  };
  
  const getMonthName = (month: number): string => {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return months[month];
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Planning</h1>
          <p className="text-muted-foreground">Consultez et gérez le planning des employés</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevMonth}>
            &lt;
          </Button>
          <Button variant="outline" size="sm" onClick={handleToday}>
            Aujourd'hui
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextMonth}>
            &gt;
          </Button>
          <div className="bg-primary/10 rounded-md px-3 py-1.5 text-sm font-medium text-primary">
            <Calendar className="inline-block h-4 w-4 mr-1" />
            {getMonthName(currentMonth)} {currentYear}
          </div>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/50 p-2">
          <CardTitle className="text-lg">Planning des employés</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Légende</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {statuses.map((status) => (
              <div key={status.code} className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{backgroundColor: status.color}}
                ></div>
                <span>{status.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
