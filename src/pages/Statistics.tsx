
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
import { calculateEmployeeStats } from '@/utils/statsUtils';
import { Employee, MonthData, SummaryStats } from '@/types';

interface EmployeeStatsData {
  name: string;
  present: number;
  absent: number;
  vacation: number;
  training: number;
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
  const [statsData, setStatsData] = useState<EmployeeStatsData[]>([]);
  const [totalStats, setTotalStats] = useState<SummaryStats>({
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    vacationDays: 0,
    trainingDays: 0,
    managementDays: 0,
    projectDays: 0,
    vigiDays: 0,
    tpDays: 0,
    coordinatorDays: 0,
    otherAbsenceDays: 0,
    regisseurDays: 0,
    demenagementDays: 0,
    projectStats: {}
  });
  
  useEffect(() => {
    calculateStats(data.employees, currentYear, currentMonth);
  }, [data.employees, currentYear, currentMonth]);
  
  const handleMonthChange = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };
  
  const calculateStats = (employees: Employee[], year: number, month: number) => {
    const employeeStats: EmployeeStatsData[] = [];
    let totals: SummaryStats = {
      totalDays: 0,
      presentDays: 0,
      absentDays: 0,
      vacationDays: 0,
      trainingDays: 0,
      managementDays: 0,
      projectDays: 0,
      vigiDays: 0,
      tpDays: 0,
      coordinatorDays: 0,
      otherAbsenceDays: 0,
      regisseurDays: 0,
      demenagementDays: 0,
      projectStats: {}
    };
    
    employees.forEach((employee) => {
      const stats = calculateEmployeeStats(employee, year, month);
      
      employeeStats.push({
        name: employee.name,
        present: stats.presentDays,
        absent: stats.absentDays,
        vacation: stats.vacationDays,
        training: stats.trainingDays
      });
      
      // Add to totals
      totals.presentDays += stats.presentDays;
      totals.absentDays += stats.absentDays;
      totals.vacationDays += stats.vacationDays;
      totals.trainingDays += stats.trainingDays;
      totals.managementDays += stats.managementDays;
      totals.projectDays += stats.projectDays;
      totals.vigiDays += stats.vigiDays;
      totals.tpDays += stats.tpDays;
      totals.coordinatorDays += stats.coordinatorDays;
      totals.otherAbsenceDays += stats.otherAbsenceDays;
      totals.regisseurDays += stats.regisseurDays;
      totals.demenagementDays += stats.demenagementDays;
    });
    
    // Set total days based on first employee's stats if available
    if (employees.length > 0) {
      const firstStats = calculateEmployeeStats(employees[0], year, month);
      totals.totalDays = firstStats.totalDays;
    }
    
    setStatsData(employeeStats);
    setTotalStats(totals);
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-scale-in">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Présents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <StatusCell status="assistance" className="mr-2 w-3 h-3 rounded-full" />
                <span className="text-2xl font-bold">
                  {totalStats.presentDays.toFixed(1)}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Absents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <StatusCell status="absence" className="mr-2 w-3 h-3 rounded-full" />
                <span className="text-2xl font-bold">
                  {totalStats.absentDays.toFixed(1)}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Congés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <StatusCell status="conges" className="mr-2 w-3 h-3 rounded-full" />
                <span className="text-2xl font-bold">
                  {totalStats.vacationDays.toFixed(1)}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Formation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <StatusCell status="formation" className="mr-2 w-3 h-3 rounded-full" />
                <span className="text-2xl font-bold">
                  {totalStats.trainingDays.toFixed(1)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="glass-panel p-4 animate-scale-in">
          <h2 className="text-xl font-semibold mb-4">Répartition par employé</h2>
          
          <div className="h-80">
            {statsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={statsData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" name="Présent" fill="hsl(var(--attendance-present))" />
                  <Bar dataKey="absent" name="Absent" fill="hsl(var(--attendance-absent))" />
                  <Bar dataKey="vacation" name="Congés" fill="hsl(var(--attendance-vacation))" />
                  <Bar dataKey="training" name="Formation" fill="hsl(var(--attendance-training))" />
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
