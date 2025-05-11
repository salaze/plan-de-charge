
import { useCallback, useState, useEffect } from 'react';
import { Employee, StatusCode, SummaryStats } from '@/types';
import { calculateBatchEmployeeStats } from '@/utils/statsUtils';
import { prepareChartDataPoint } from '@/utils/statsChartUtils';

export const useStatsCalculator = () => {
  const [stats, setStats] = useState<SummaryStats[]>([]);
  const [chartData, setChartData] = useState<Array<{ name: string; [key: string]: number | string }>>([]);

  // Clear stats when component unmounts to prevent stale data
  useEffect(() => {
    return () => {
      setStats([]);
      setChartData([]);
    };
  }, []);

  const calculateStats = useCallback((
    employees: Employee[],
    year: number,
    month: number,
    availableStatusCodes: StatusCode[]
  ) => {
    console.time('stats-calculation');
    
    if (employees.length === 0 || availableStatusCodes.length === 0) {
      console.log('Insufficient data for statistics calculation');
      return { stats: [], chartData: [] };
    }

    console.log(`Calculating stats with ${availableStatusCodes.length} available status codes`);

    // Use the optimized batch processing to prevent UI freezing
    const calculatedStats = calculateBatchEmployeeStats(employees, year, month, 10);
    
    // Convert stats to chart data format in a single pass
    const calculatedChartData = calculatedStats.map(employeeStat => 
      prepareChartDataPoint(employeeStat, availableStatusCodes)
    );

    // Update state values and return them
    setStats(calculatedStats);
    setChartData(calculatedChartData);
    
    console.timeEnd('stats-calculation');
    console.log(`Statistics calculated for ${employees.length} employees with ${availableStatusCodes.length} status codes`);
    
    return { stats: calculatedStats, chartData: calculatedChartData };
  }, []);

  return { 
    stats,
    chartData,
    calculateStats 
  };
};
