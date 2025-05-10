
import { useCallback, useState } from 'react';
import { Employee, StatusCode, SummaryStats } from '@/types';
import { calculateEmployeeStats } from '@/utils/statsUtils';

interface EmployeeStatusData {
  name: string;
  [key: string]: number | string;
}

export const useStatsCalculator = () => {
  const [employeeStats, setEmployeeStats] = useState<SummaryStats[]>([]);
  const [chartData, setChartData] = useState<EmployeeStatusData[]>([]);

  const calculateStats = useCallback((
    employees: Employee[],
    year: number,
    month: number,
    availableStatusCodes: StatusCode[]
  ) => {
    console.log('Calcul des statistiques...');
    
    if (employees.length === 0 || availableStatusCodes.length === 0) {
      console.warn('Pas assez de données pour calculer des statistiques');
      setChartData([]);
      setEmployeeStats([]);
      return;
    }

    const stats: SummaryStats[] = [];
    const chartData: EmployeeStatusData[] = [];

    // Calcul optimisé des statistiques
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
    
    setEmployeeStats(stats);
    setChartData(chartData);
    console.log('Statistiques calculées avec succès');
  }, []);

  return {
    employeeStats,
    chartData,
    calculateStats
  };
};
