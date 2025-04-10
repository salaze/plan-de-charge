import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { MonthSelector } from '@/components/calendar/MonthSelector';
import { StatusCell } from '@/components/calendar/StatusCell';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calculateEmployeeStats } from '@/utils/stats/calculateStats';
import { Employee, MonthData, SummaryStats, StatusCode, STATUS_LABELS, DateRange } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface EmployeeStatusData {
  name: string;
  [key: string]: number | string;
}

const Statistics = () => {
  const [data, setData] = useState<MonthData>(() => {
    const savedData = localStorage.getItem('planningData');
    return savedData ? JSON.parse(savedData) : { 
      year: new Date().getFullYear(), 
      month: new Date().getMonth(), 
      employees: [],
      projects: []
    };
  });
  
  const [currentYear, setCurrentYear] = useState(data.year);
  const [currentMonth, setCurrentMonth] = useState(data.month);
  const [employeeStats, setEmployeeStats] = useState<SummaryStats[]>([]);
  const [chartData, setChartData] = useState<EmployeeStatusData[]>([]);
  const [allStatusCodes, setAllStatusCodes] = useState<StatusCode[]>([]);
  
  useEffect(() => {
    calculateStats(data.employees, currentYear, currentMonth);
  }, [data.employees, currentYear, currentMonth]);
  
  const handleMonthChange = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };
  
  const calculateStats = (employees: Employee[], year: number, month: number) => {
    // Stocker les statistiques par employé
    const stats: SummaryStats[] = [];
    const statusCodes = new Set<StatusCode>();
    
    // Create a DateRange object for the current month
    const startDate = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0).getDate();
    const endDate = new Date(year, month, lastDay);
    const dateRange: DateRange = { start: startDate, end: endDate };
    
    // Calculer les statistiques pour chaque employé
    employees.forEach((employee) => {
      const employeeStats = calculateEmployeeStats(employee, dateRange, []);
      stats.push({
        ...employeeStats,
        employeeName: employee.name
      });
    });
    
    // Trouver tous les statuts utilisés
    Object.keys(STATUS_LABELS).forEach(status => {
      if (status) {
        statusCodes.add(status as StatusCode);
      }
    });
    
    // Préparer les données pour le graphique
    const chartData: EmployeeStatusData[] = employees.map(employee => {
      const employeeStats = calculateEmployeeStats(employee, dateRange, []);
      const dataPoint: EmployeeStatusData = { name: employee.name };
      
      // Ajouter chaque type de statut
      Array.from(statusCodes).forEach(status => {
        switch(status) {
          case 'assistance':
            dataPoint[status] = employeeStats.presentDays - 
              employeeStats.vigiDays - 
              employeeStats.trainingDays - 
              employeeStats.projectDays - 
              employeeStats.managementDays - 
              employeeStats.coordinatorDays - 
              employeeStats.regisseurDays - 
              employeeStats.demenagementDays -
              employeeStats.permanenceDays;
            break;
          case 'vigi':
            dataPoint[status] = employeeStats.vigiDays;
            break;
          case 'formation':
            dataPoint[status] = employeeStats.trainingDays;
            break;
          case 'projet':
            dataPoint[status] = employeeStats.projectDays;
            break;
          case 'conges':
            dataPoint[status] = employeeStats.vacationDays;
            break;
          case 'management':
            dataPoint[status] = employeeStats.managementDays;
            break;
          case 'tp':
            dataPoint[status] = employeeStats.tpDays;
            break;
          case 'coordinateur':
            dataPoint[status] = employeeStats.coordinatorDays;
            break;
          case 'absence':
            dataPoint[status] = employeeStats.otherAbsenceDays;
            break;
          case 'regisseur':
            dataPoint[status] = employeeStats.regisseurDays;
            break;
          case 'demenagement':
            dataPoint[status] = employeeStats.demenagementDays;
            break;
          case 'permanence':
            dataPoint[status] = employeeStats.permanenceDays;
            break;
        }
      });
      
      return dataPoint;
    });
    
    setEmployeeStats(stats);
    setChartData(chartData);
    setAllStatusCodes(Array.from(statusCodes));
  };
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold mb-6">Statistiques</h1>
        
        <MonthSelector 
          year={currentYear} 
          month={currentMonth} 
          onChange={handleMonthChange} 
        />
        
        <div className="glass-panel p-6 animate-scale-in">
          <h2 className="text-xl font-semibold mb-4">Répartition des statuts par employé</h2>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employé</TableHead>
                {allStatusCodes.map(status => (
                  <TableHead key={status}>
                    <div className="flex items-center gap-2">
                      <StatusCell status={status} className="w-3 h-3 rounded-full" />
                      {STATUS_LABELS[status]}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {chartData.length > 0 ? (
                chartData.map((employee) => (
                  <TableRow key={employee.name}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    {allStatusCodes.map(status => (
                      <TableCell key={status}>
                        {typeof employee[status] === 'number'
                          ? (employee[status] as number).toFixed(1)
                          : '0.0'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={allStatusCodes.length + 1} className="text-center text-muted-foreground">
                    Aucune donnée disponible
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="glass-panel p-4 animate-scale-in">
          <h2 className="text-xl font-semibold mb-4">Graphique par employé</h2>
          
          <div className="h-80">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {allStatusCodes.map(status => (
                    <Bar 
                      key={status}
                      dataKey={status} 
                      name={STATUS_LABELS[status]} 
                      stackId="a"
                      fill={`var(--${status}-color, #888)`}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Statistics;
