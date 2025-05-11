
import { useCallback } from 'react';
import { Employee, StatusCode, SummaryStats } from '@/types';
import { calculateBatchEmployeeStats } from '@/utils/statsUtils';
import { prepareChartDataPoint } from '@/utils/statsChartUtils';
import { useQuery } from '@tanstack/react-query';

export const useStatsCalculator = (
  employees: Employee[],
  year: number,
  month: number,
  statusCodes: StatusCode[]
) => {
  // Fonction de calcul des statistiques
  const calculateStats = useCallback(() => {
    console.time('stats-calculation');
    
    if (employees.length === 0 || statusCodes.length === 0) {
      console.log('Insufficient data for statistics calculation');
      return { stats: [], chartData: [] };
    }

    console.log(`Calculating stats with ${statusCodes.length} available status codes`);

    // Utiliser le traitement par lots optimisé pour éviter le gel de l'interface
    const calculatedStats = calculateBatchEmployeeStats(employees, year, month, 10);
    
    // Convertir les statistiques en format de données pour les graphiques en une seule passe
    const calculatedChartData = calculatedStats.map(employeeStat => 
      prepareChartDataPoint(employeeStat, statusCodes)
    );
    
    console.timeEnd('stats-calculation');
    console.log(`Statistics calculated for ${employees.length} employees with ${statusCodes.length} status codes`);
    
    return { stats: calculatedStats, chartData: calculatedChartData };
  }, [employees, year, month, statusCodes]);

  // Utiliser React Query pour mettre en cache les résultats
  const queryKey = ['statistics', year, month, employees.length, statusCodes.join(',')];
  
  const { data = { stats: [], chartData: [] }, isLoading } = useQuery({
    queryKey,
    queryFn: calculateStats,
    enabled: employees.length > 0 && statusCodes.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { 
    stats: data.stats,
    chartData: data.chartData,
    isLoading
  };
};
