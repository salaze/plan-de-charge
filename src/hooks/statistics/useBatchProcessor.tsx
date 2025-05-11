
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
    
    // Traitement optimisé avec boucle for classique pour de meilleures performances
    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i];
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
    }
    
    return { stats, chartData };
  };
  
  const processInBatches = (
    employees: Employee[],
    year: number,
    month: number,
    availableStatusCodes: StatusCode[],
    batchSize: number = 10 // Augmenter légèrement la taille du batch
  ): BatchProcessingResult => {
    const stats: SummaryStats[] = [];
    const chartData: EmployeeStatusData[] = [];
    
    // Traitement synchrone pour les petits ensembles
    if (employees.length <= batchSize || !shouldUseWorkers(employees.length)) {
      return processBatch(employees, year, month, availableStatusCodes);
    }
    
    // Traitement par lots pour les grands ensembles
    for (let i = 0; i < employees.length; i += batchSize) {
      const batch = employees.slice(i, i + batchSize);
      const batchResult = processBatch(batch, year, month, availableStatusCodes);
      
      stats.push(...batchResult.stats);
      chartData.push(...batchResult.chartData);
    }
    
    return { stats, chartData };
  };
  
  return { processInBatches };
};
