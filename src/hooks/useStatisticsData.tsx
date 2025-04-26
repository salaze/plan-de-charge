
import { useState, useEffect, useCallback } from 'react';
import { MonthData, Employee, StatusCode, SummaryStats } from '@/types';
import { calculateEmployeeStats } from '@/utils/statsUtils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

  // Function to calculate statistics
  const calculateStats = useCallback((
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
  }, []);

  // Effet principal pour calculer les statistiques
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
  }, [localData, currentYear, currentMonth, statusCodes, calculateStats]);

  // Configurer les abonnements en temps réel pour les mises à jour du planning et des employés
  useEffect(() => {
    // Suivi des changements dans le planning
    const scheduleChannel = supabase
      .channel('statistics-schedule-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employe_schedule'
        },
        (payload) => {
          console.log('Changement dans le planning détecté:', payload);
          toast.info('Mise à jour du planning détectée', {
            description: 'Les statistiques vont être actualisées'
          });
          
          // Actualiser les données depuis localStorage car c'est la source de vérité actuelle
          const savedData = localStorage.getItem('planningData');
          if (savedData) {
            try {
              const parsedData = JSON.parse(savedData) as MonthData;
              if (parsedData.employees?.length > 0 && statusCodes.length > 0) {
                calculateStats(parsedData.employees, currentYear, currentMonth, statusCodes);
              }
            } catch (error) {
              console.error('Error parsing localStorage data:', error);
            }
          }
        }
      )
      .subscribe((status) => {
        if (status !== 'SUBSCRIBED') {
          console.error('Échec de l\'abonnement aux changements du planning:', status);
        } else {
          console.log('Abonnement aux changements du planning réussi');
        }
      });

    // Suivi des changements d'employés
    const employeeChannel = supabase
      .channel('statistics-employees-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employes'
        },
        (payload) => {
          console.log('Changement d\'employé détecté:', payload);
          toast.info('Mise à jour des employés détectée', {
            description: 'Les statistiques vont être actualisées'
          });
          
          // Actualiser les données depuis localStorage
          const savedData = localStorage.getItem('planningData');
          if (savedData) {
            try {
              const parsedData = JSON.parse(savedData) as MonthData;
              if (parsedData.employees?.length > 0 && statusCodes.length > 0) {
                calculateStats(parsedData.employees, currentYear, currentMonth, statusCodes);
              }
            } catch (error) {
              console.error('Error parsing localStorage data:', error);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(scheduleChannel);
      supabase.removeChannel(employeeChannel);
    };
  }, [currentYear, currentMonth, statusCodes, calculateStats]);

  return {
    employeeStats,
    chartData,
    isLoading
  };
};
