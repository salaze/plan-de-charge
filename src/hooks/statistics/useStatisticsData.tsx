
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { StatusCode } from '@/types';
import { generateDaysInMonth, formatDate } from '@/utils/dateUtils';
import { useEmployeeLoader } from './useEmployeeLoader';
import { useScheduleLoader } from './useScheduleLoader';
import { useStatsCalculator } from './useStatsCalculator';
import { useRealtimeUpdates } from './useRealtimeUpdates';
import { useLoadingState } from './useLoadingState';
import { toast } from 'sonner';

export const useStatisticsData = (
  currentYear: number,
  currentMonth: number,
  statusCodes: StatusCode[],
  selectedDepartment: string = 'all'
) => {
  const { employees, fetchEmployees } = useEmployeeLoader();
  const { fetchSchedules } = useScheduleLoader();
  const { employeeStats, chartData, calculateStats } = useStatsCalculator();
  const { isLoading, setIsLoading, loadingState, setLoadingState, refreshKey, incrementRefreshKey } = useLoadingState();
  const [loadTimeout, setLoadTimeout] = useState(false);
  
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
      const timer = setTimeout(() => {
        setLoadTimeout(true);
      }, 10000); // Show timeout message after 10 seconds
      
      return () => clearTimeout(timer);
    } else {
      setLoadTimeout(false);
    }
  }, [isLoading]);

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
        console.log('Loading data from Supabase for', currentYear, currentMonth, 'department:', selectedDepartment);

        // Set a timeout to prevent infinite loading states
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          if (isLoading) {
            setIsLoading(false);
            setLoadingState('idle');
            toast.error('Statistics loading timeout - please try again');
            console.error('Statistics loading timeout');
          }
        }, maxLoadingTime);

        // 1. Determine date range for the selected month
        const days = generateDaysInMonth(currentYear, currentMonth);
        const startDate = formatDate(days[0]);
        const endDate = formatDate(days[days.length - 1]);
        console.log(`Period: ${startDate} to ${endDate}`);

        // 2. Load employees with optimization
        setLoadingState('loading-employees');
        const loadedEmployees = await fetchEmployees(selectedDepartment);
        
        if (loadedEmployees.length === 0) {
          toast.warning('No employees found for the selected department');
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
          chartData
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
  }, [currentYear, currentMonth, statusCodes, selectedDepartment, fetchEmployees, fetchSchedules, calculateStats, refreshKey, cacheKey, chartData, isLoading]);

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
    refreshData
  };
};
