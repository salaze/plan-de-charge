
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
  statusCodes: StatusCode[],
  localData: MonthData | null
) => {
  const [employeeStats, setEmployeeStats] = useState<SummaryStats[]>([]);
  const [chartData, setChartData] = useState<EmployeeStatusData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    
    if (localData?.employees?.length > 0 && statusCodes.length > 0) {
      console.log('Calculating statistics with:', {
        employeeCount: localData.employees.length,
        year: currentYear,
        month: currentMonth,
        statusCodes
      });
      calculateStats(localData.employees, currentYear, currentMonth, statusCodes);
    } else {
      console.log('Cannot calculate statistics, missing data:', {
        hasEmployees: localData?.employees?.length > 0,
        statusCodesCount: statusCodes.length
      });
      setChartData([]);
      setEmployeeStats([]);
    }
    
    setIsLoading(false);
  }, [localData, currentYear, currentMonth, statusCodes]);

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
                employeeStats.permanenceDays -
                employeeStats.parcDays;
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

    console.log('Statistics calculated:', {
      employeeStatsCount: stats.length,
      chartDataCount: chartData.length
    });
    
    setEmployeeStats(stats);
    setChartData(chartData);
  };

  return {
    employeeStats,
    chartData,
    isLoading
  };
};
