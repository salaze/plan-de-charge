
import { useCallback, useState, useMemo } from 'react';
import { Employee, StatusCode, SummaryStats } from '@/types';
import { useBatchProcessor } from './useBatchProcessor';

interface EmployeeStatusData {
  name: string;
  [key: string]: number | string;
}

interface StatsResult {
  stats: SummaryStats[];
  chartData: EmployeeStatusData[];
}

export const useStatsCalculator = () => {
  const [employeeStats, setEmployeeStats] = useState<{
    stats: SummaryStats[];
    chartData: EmployeeStatusData[];
  }>({ stats: [], chartData: [] });
  const { processInBatches } = useBatchProcessor();

  const calculateStats = useCallback((
    employees: Employee[],
    year: number,
    month: number,
    availableStatusCodes: StatusCode[]
  ) => {
    console.log('Calcul des statistiques...');
    
    if (employees.length === 0 || availableStatusCodes.length === 0) {
      console.warn('Pas assez de données pour calculer des statistiques');
      setEmployeeStats({ stats: [], chartData: [] });
      return;
    }

    // Process all employees using the batch processor
    const result = processInBatches(employees, year, month, availableStatusCodes);
    
    setEmployeeStats(result);
    console.log('Statistiques calculées avec succès');
  }, [processInBatches]);

  // Memoized results to avoid unnecessary re-renders
  const memoizedResults = useMemo(() => ({
    employeeStats,
    calculateStats
  }), [employeeStats, calculateStats]);

  return memoizedResults;
};
