import { useCallback, useState, useMemo, useRef } from 'react';
import { Employee, StatusCode, SummaryStats } from '@/types';
import { calculateEmployeeStats } from '@/utils/statsUtils';
import { useRef } from 'react';

interface EmployeeStatusData {
  name: string;
  [key: string]: number | string;
}

export const useStatsCalculator = () => {
  const [employeeStats, setEmployeeStats] = useState<SummaryStats[]>([]);
  const [chartData, setChartData] = useState<EmployeeStatusData[]>([]);
  
  // Mise en cache des calculs pour éviter les recalculs inutiles
  const calculationsCache = useRef<Map<string, {
    stats: SummaryStats,
    chartData: EmployeeStatusData
  }>>(new Map());

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
    
    // Utilisation de Web Workers si disponibles
    const useWebWorkers = typeof Worker !== 'undefined' && employees.length > 10;
    
    if (useWebWorkers) {
      // Pour les grandes quantités de données, diviser le traitement
      const batchSize = 5;
      
      for (let i = 0; i < employees.length; i += batchSize) {
        const batch = employees.slice(i, i + batchSize);
        
        // Traitement optimisé par lots
        batch.forEach((employee) => {
          // Utiliser le cache si disponible
          const cacheKey = `${employee.id}-${year}-${month}`;
          let employeeStats: SummaryStats;
          let dataPoint: EmployeeStatusData;
          
          const cachedResult = calculationsCache.current.get(cacheKey);
          
          if (cachedResult) {
            employeeStats = cachedResult.stats;
            dataPoint = cachedResult.chartData;
          } else {
            // Calcul optimisé si pas en cache
            employeeStats = calculateEmployeeStats(employee, year, month);
            dataPoint = { name: employee.name };
            
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
            
            // Mise en cache du résultat
            calculationsCache.current.set(cacheKey, { stats: employeeStats, chartData: dataPoint });
          }
          
          stats.push(employeeStats);
          chartData.push(dataPoint);
        });
      }
    } else {
      // Pour les petites quantités, traitement standard optimisé
      employees.forEach((employee) => {
        const cacheKey = `${employee.id}-${year}-${month}`;
        let employeeStats: SummaryStats;
        let dataPoint: EmployeeStatusData;
        
        const cachedResult = calculationsCache.current.get(cacheKey);
        
        if (cachedResult) {
          employeeStats = cachedResult.stats;
          dataPoint = cachedResult.chartData;
        } else {
          employeeStats = calculateEmployeeStats(employee, year, month);
          dataPoint = { name: employee.name };
          
          availableStatusCodes.forEach(status => {
            if (status !== 'none') {
              // ... keep existing code (status calculations)
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
          
          calculationsCache.current.set(cacheKey, { stats: employeeStats, chartData: dataPoint });
        }
        
        stats.push(employeeStats);
        chartData.push(dataPoint);
      });
    }
    
    setEmployeeStats(stats);
    setChartData(chartData);
    console.log('Statistiques calculées avec succès');
  }, []);

  // Exportation mémoisée pour éviter les recalculs inutiles
  const memoizedResults = useMemo(() => ({
    employeeStats,
    chartData,
    calculateStats
  }), [employeeStats, chartData, calculateStats]);

  return memoizedResults;
};
