
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { StatusCode } from '@/types';
import { generateDaysInMonth, formatDate } from '@/utils/dateUtils';
import { useEmployeeLoader } from './useEmployeeLoader';
import { useScheduleLoader } from './useScheduleLoader';
import { useStatsCalculator } from './useStatsCalculator';
import { useRealtimeUpdates } from './useRealtimeUpdates';
import { useLoadingState } from './useLoadingState';
import { filterChartDataByDepartment } from '@/utils/departmentUtils';
import { toast } from 'sonner';

export const useStatisticsData = (
  currentYear: number,
  currentMonth: number,
  statusCodes: StatusCode[],
  selectedDepartment: string = 'all'
) => {
  const { employees, fetchEmployees } = useEmployeeLoader();
  const { fetchSchedules } = useScheduleLoader();
  const { employeeStats, chartData: originalChartData, calculateStats } = useStatsCalculator();
  const { isLoading, setIsLoading, loadingState, setLoadingState, refreshKey, incrementRefreshKey } = useLoadingState();
  const [loadTimeout, setLoadTimeout] = useState(false);
  const [chartData, setChartData] = useState<Array<{ name: string; [key: string]: number | string }>>([]);
  
  // Cache key for optimizing renders
  const cacheKey = `${currentYear}-${currentMonth}-${selectedDepartment}`;
  const previousCacheKey = useRef('');
  const cachedData = useRef<{
    employees: any[];
    chartData: any[];
  } | null>(null);
  
  // Realtime updates and optimization
  const { refreshData } = useRealtimeUpdates(incrementRefreshKey);
  
  // Timeout to prevent infinite loading
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxLoadingTime = 15000; // 15 seconds max
  
  // Handle loading timeouts
  useEffect(() => {
    if (isLoading) {
      console.log('Statistics loading started, setting up timeout detection');
      const timer = setTimeout(() => {
        console.log('Loading timeout detected!');
        setLoadTimeout(true);
      }, 10000); // Show timeout message after 10 seconds
      
      return () => clearTimeout(timer);
    } else {
      setLoadTimeout(false);
    }
  }, [isLoading]);

  // Filter chart data when selected department changes
  useEffect(() => {
    if (originalChartData.length > 0) {
      const filtered = filterChartDataByDepartment(originalChartData, selectedDepartment);
      console.log(`Filtered chart data for department ${selectedDepartment}: ${filtered.length} items`);
      setChartData(filtered);
    } else {
      setChartData([]);
    }
  }, [originalChartData, selectedDepartment]);

  // Main data loading effect
  useEffect(() => {
    // Check cache first to avoid unnecessary reloads
    if (cacheKey === previousCacheKey.current && cachedData.current) {
      console.log('Using cached data for', cacheKey);
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);
        console.log('Loading data for', currentYear, currentMonth, 'department:', selectedDepartment);

        // Set a timeout to prevent infinite loading states
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          if (isLoading) {
            console.error('Statistics loading timeout - forcing completion');
            setIsLoading(false);
            setLoadingState('idle');
            toast.error('Statistics loading timeout - please try again');
          }
        }, maxLoadingTime);

        // 1. Determine date range for the selected month
        const days = generateDaysInMonth(currentYear, currentMonth);
        const startDate = formatDate(days[0]);
        const endDate = formatDate(days[days.length - 1]);
        console.log(`Period: ${startDate} to ${endDate}`);

        // 2. Load employees - optimized to fetch only the department we need
        setLoadingState('loading-employees');
        // Always load all employees first, then filter later for consistency
        const loadedEmployees = await fetchEmployees('all');
        
        if (loadedEmployees.length === 0) {
          toast.warning('No employees found');
          setIsLoading(false);
          setLoadingState('idle');
          return;
        }
        
        // 3. Load all schedules in a single optimized query
        setLoadingState('loading-schedules');
        const employeesWithSchedules = await fetchSchedules(loadedEmployees, startDate, endDate);
        
        // 4. Calculate statistics with optimization
        setLoadingState('calculating');
        calculateStats(employeesWithSchedules, currentYear, currentMonth, statusCodes);
        
        // Cache results
        cachedData.current = {
          employees: employeesWithSchedules,
          chartData: originalChartData
        };
        previousCacheKey.current = cacheKey;
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Error loading statistics');
      } finally {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setIsLoading(false);
        setLoadingState('idle');
      }
    };

    // Trigger data loading
    loadData();
    
    return () => {
      // Clean up timeout on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentYear, currentMonth, statusCodes, fetchEmployees, fetchSchedules, calculateStats, refreshKey, cacheKey, originalChartData, isLoading]);

  // Detailed loading state for debugging
  const loadingDetails = useMemo(() => {
    return {
      state: loadingState,
      employeesCount: employees.length,
      statusCodesCount: statusCodes.length,
      chartDataCount: chartData.length,
      selectedDepartment,
      loadTimeout
    };
  }, [loadingState, employees.length, statusCodes.length, chartData.length, selectedDepartment, loadTimeout]);

  return {
    employeeStats,
    chartData,
    isLoading,
    loadTimeout,
    loadingDetails,
    refreshData,
    loadingState // Export the loadingState variable to fix the error
  };
};
