
import { useCallback } from 'react';
import { Employee, StatusCode, SummaryStats } from '@/types';
import { calculateBatchEmployeeStats } from '@/utils/statsUtils';
import { prepareChartDataPoint } from '@/utils/statsChartUtils';

export const useStatsCalculator = () => {
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

    // Use the optimized batch processing to prevent UI freezing
    const stats = calculateBatchEmployeeStats(employees, year, month, 10);
    
    // Convert stats to chart data format in a single pass
    const chartData = stats.map(employeeStat => 
      prepareChartDataPoint(employeeStat, availableStatusCodes)
    );
    
    console.timeEnd('stats-calculation');
    console.log(`Statistics calculated for ${employees.length} employees`);
    
    return { stats, chartData };
  }, []);

  return { calculateStats };
};
