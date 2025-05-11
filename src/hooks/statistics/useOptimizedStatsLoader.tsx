
import { useState, useMemo, useCallback, useEffect } from 'react';
import { StatusCode } from '@/types';
import { generateDaysInMonth, formatDate } from '@/utils/dateUtils';
import { useEmployeeLoader } from './useEmployeeLoader';
import { useScheduleLoader } from './useScheduleLoader';
import { useStatsCalculator } from './useStatsCalculator';
import { toast } from 'sonner';

export const useOptimizedStatsLoader = (
  currentYear: number,
  currentMonth: number,
  statusCodes: StatusCode[],
) => {
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<Array<{ name: string; [key: string]: number | string }>>([]);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const { employees, fetchEmployees } = useEmployeeLoader();
  const { fetchSchedules } = useScheduleLoader();
  const { calculateStats } = useStatsCalculator();
  
  // Cache key based on current selection
  const cacheKey = useMemo(() => 
    `stats_${currentYear}_${currentMonth}_${statusCodes.join('_')}_${refreshCounter}`,
  [currentYear, currentMonth, statusCodes, refreshCounter]);
  
  // Load data efficiently
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        if (!isMounted) return;
        setIsLoading(true);
        
        console.log('Loading optimized statistics for:', currentYear, currentMonth);
        
        // Step 1: Generate date range for the month
        const days = generateDaysInMonth(currentYear, currentMonth);
        const startDate = formatDate(days[0]);
        const endDate = formatDate(days[days.length - 1]);
        
        // Step 2: Load employees (uses internal caching)
        const loadedEmployees = await fetchEmployees();
        if (!isMounted) return;
        
        // Step 3: Load schedules for the employees
        const employeesWithSchedules = await fetchSchedules(loadedEmployees, startDate, endDate);
        if (!isMounted) return;
        
        // Step 4: Calculate stats
        const { stats, chartData } = calculateStats(employeesWithSchedules, currentYear, currentMonth, statusCodes);
        if (!isMounted) return;
        
        setChartData(chartData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading statistics:', error);
        if (isMounted) {
          toast.error('Erreur lors du chargement des statistiques');
          setIsLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [cacheKey, fetchEmployees, fetchSchedules, calculateStats]);
  
  // Function to trigger a refresh
  const refreshData = useCallback(() => {
    setRefreshCounter(prev => prev + 1);
  }, []);
  
  return {
    chartData,
    isLoading,
    refreshData
  };
};
