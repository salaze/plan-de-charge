
import { useState, useMemo, useCallback, useEffect } from 'react';
import { StatusCode } from '@/types';
import { generateDaysInMonth, formatDate } from '@/utils/dateUtils';
import { useEmployeeLoader } from './useEmployeeLoader';
import { useScheduleLoader } from './useScheduleLoader';
import { useStatsCalculator } from './useStatsCalculator';
import { toast } from 'sonner';
import { syncStatusesWithDatabase } from '@/utils/supabase/status';

export const useOptimizedStatsLoader = (
  currentYear: number,
  currentMonth: number,
  statusCodes: StatusCode[],
) => {
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<Array<{ name: string; [key: string]: number | string }>>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const { employees, fetchEmployees } = useEmployeeLoader();
  const { fetchSchedules } = useScheduleLoader();
  const { calculateStats } = useStatsCalculator();
  
  // Cache key based on current selection and status codes
  const cacheKey = useMemo(() => 
    `stats_${currentYear}_${currentMonth}_${statusCodes.join('_')}_${refreshCounter}`,
  [currentYear, currentMonth, statusCodes, refreshCounter]);
  
  // Synchronize statuses when component mounts
  useEffect(() => {
    const syncStatuses = async () => {
      try {
        await syncStatusesWithDatabase();
        console.log("Statuses synchronized with database");
      } catch (error) {
        console.error("Error synchronizing statuses", error);
      }
    };
    
    syncStatuses();
  }, []);

  // Listen for status updates
  useEffect(() => {
    const handleStatusesUpdated = () => {
      console.log("Statuses updated, refreshing statistics");
      setRefreshCounter(prev => prev + 1);
    };
    
    window.addEventListener('statusesUpdated', handleStatusesUpdated);
    
    return () => {
      window.removeEventListener('statusesUpdated', handleStatusesUpdated);
    };
  }, []);
  
  // Load data efficiently
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        if (!isMounted) return;
        setIsLoading(true);
        
        // Check if statuses are empty
        if (statusCodes.length === 0) {
          console.log('No statuses available, calculation of statistics postponed');
          setIsLoading(false);
          return;
        }
        
        console.log('Loading optimized statistics for:', currentYear, currentMonth);
        console.log('Using status codes:', statusCodes);
        
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
        const { stats: calculatedStats, chartData: calculatedChartData } = calculateStats(employeesWithSchedules, currentYear, currentMonth, statusCodes);
        if (!isMounted) return;
        
        setStats(calculatedStats);
        setChartData(calculatedChartData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading statistics:', error);
        if (isMounted) {
          toast.error('Error loading statistics');
          setIsLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [cacheKey, fetchEmployees, fetchSchedules, calculateStats, statusCodes.length, currentYear, currentMonth]);
  
  // Function to trigger a refresh
  const refreshData = useCallback(() => {
    setRefreshCounter(prev => prev + 1);
  }, []);
  
  return {
    stats,
    chartData,
    isLoading,
    refreshData
  };
};
