
import { useState } from 'react';
import { Employee, StatusCode, SummaryStats } from '@/types';
import { calculateEmployeeStats } from '@/utils/statsUtils';
import { prepareChartDataPoint } from '@/utils/statsChartUtils';
import { useStatsCache } from './useStatsCache';
import { useWorkerDetection } from './useWorkerDetection';

interface EmployeeStatusData {
  name: string;
  [key: string]: number | string;
}

interface BatchProcessingResult {
  stats: SummaryStats[];
  chartData: EmployeeStatusData[];
}

export const useBatchProcessor = () => {
  const { getCachedResult, setCachedResult } = useStatsCache();
  const { shouldUseWorkers } = useWorkerDetection();
  
  const processBatch = (
    employees: Employee[],
    year: number,
    month: number,
    availableStatusCodes: StatusCode[]
  ): BatchProcessingResult => {
    const stats: SummaryStats[] = [];
    const chartData: EmployeeStatusData[] = [];
    
    employees.forEach((employee) => {
      const cacheKey = `${employee.id}-${year}-${month}`;
      let employeeStats: SummaryStats;
      let dataPoint: EmployeeStatusData;
      
      const cachedResult = getCachedResult(cacheKey);
      
      if (cachedResult) {
        employeeStats = cachedResult.stats;
        dataPoint = cachedResult.chartData;
      } else {
        // Calculate stats if not in cache
        employeeStats = calculateEmployeeStats(employee, year, month);
        dataPoint = prepareChartDataPoint(employeeStats, availableStatusCodes);
        
        // Store in cache
        setCachedResult(cacheKey, employeeStats, dataPoint);
      }
      
      stats.push(employeeStats);
      chartData.push(dataPoint);
    });
    
    return { stats, chartData };
  };
  
  const processInBatches = (
    employees: Employee[],
    year: number,
    month: number,
    availableStatusCodes: StatusCode[],
    batchSize: number = 5
  ): BatchProcessingResult => {
    const stats: SummaryStats[] = [];
    const chartData: EmployeeStatusData[] = [];
    
    // Process in batches if there are many employees
    if (shouldUseWorkers(employees.length)) {
      for (let i = 0; i < employees.length; i += batchSize) {
        const batch = employees.slice(i, i + batchSize);
        const batchResult = processBatch(batch, year, month, availableStatusCodes);
        
        stats.push(...batchResult.stats);
        chartData.push(...batchResult.chartData);
      }
    } else {
      // Process all at once for smaller datasets
      const result = processBatch(employees, year, month, availableStatusCodes);
      stats.push(...result.stats);
      chartData.push(...result.chartData);
    }
    
    return { stats, chartData };
  };
  
  return { processInBatches };
};
