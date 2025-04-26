
import { useState, useEffect } from 'react';
import { MonthData, Employee, StatusCode, SummaryStats } from '@/types';
import { calculateEmployeeStats } from '@/utils/statsUtils';

interface EmployeeStatusData {
  name: string;
  [key: string]: number | string;
}

export const useStatisticsData = (
  currentYear: number,
  currentMonth: number,
  statusCodes: StatusCode[]
) => {
  const [data, setData] = useState<MonthData>(() => {
    const savedData = localStorage.getItem('planningData');
    return savedData ? JSON.parse(savedData) : {
      year: new Date().getFullYear(),
      month: new Date().getMonth(),
      employees: [],
      projects: []
    };
  });

  const [employeeStats, setEmployeeStats] = useState<SummaryStats[]>([]);
  const [chartData, setChartData] = useState<EmployeeStatusData[]>([]);

  useEffect(() => {
    const savedData = localStorage.getItem('planningData');
    if (savedData) {
      setData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    if (data.employees.length > 0 && statusCodes.length > 0) {
      calculateStats(data.employees, currentYear, currentMonth, statusCodes);
    }
  }, [data.employees, currentYear, currentMonth, statusCodes]);

  const calculateStats = (
    employees: Employee[],
    year: number,
    month: number,
    availableStatusCodes: StatusCode[]
  ) => {
    const stats: SummaryStats[] = [];
    const chartData: EmployeeStatusData[] = [];

    employees.forEach((employee) => {
      const employeeStats = calculateEmployeeStats(employee, year, month);
      stats.push({
        ...employeeStats,
        employeeName: employee.name
      });

      const dataPoint: EmployeeStatusData = { name: employee.name };
      availableStatusCodes.forEach(status => {
        if (status !== 'none') {
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
            case 'parc':
              dataPoint[status] = employeeStats.parcDays;
              break;
          }
        }
      });

      chartData.push(dataPoint);
    });

    setEmployeeStats(stats);
    setChartData(chartData);
  };

  return {
    employeeStats,
    chartData
  };
};
