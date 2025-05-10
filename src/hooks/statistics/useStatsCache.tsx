
import { useRef } from 'react';
import { SummaryStats } from '@/types';

interface EmployeeStatusData {
  name: string;
  [key: string]: number | string;
}

interface CacheEntry {
  stats: SummaryStats;
  chartData: EmployeeStatusData;
}

export const useStatsCache = () => {
  // Cache for calculations to avoid unnecessary recalculations
  const calculationsCache = useRef<Map<string, CacheEntry>>(new Map());
  
  const getCachedResult = (cacheKey: string) => {
    return calculationsCache.current.get(cacheKey);
  };
  
  const setCachedResult = (cacheKey: string, stats: SummaryStats, chartData: EmployeeStatusData) => {
    calculationsCache.current.set(cacheKey, { stats, chartData });
  };
  
  const clearCache = () => {
    calculationsCache.current.clear();
  };
  
  return {
    getCachedResult,
    setCachedResult,
    clearCache
  };
};
