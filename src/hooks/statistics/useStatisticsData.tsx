
import { StatusCode } from '@/types';
import { useState, useCallback, useEffect } from 'react';
import { useEmployeeLoader } from './useEmployeeLoader';
import { useScheduleLoader } from './useScheduleLoader';
import { useStatsCalculator } from './useStatsCalculator';
import { useLoadingState } from './useLoadingState';
import { filterChartDataByDepartment } from '@/utils/departmentUtils';
import { generateDaysInMonth, formatDate } from '@/utils/dateUtils';
import { toast } from 'sonner';

export const useStatisticsData = (
  currentYear: number,
  currentMonth: number,
  statusCodes: StatusCode[],
  selectedDepartment: string = 'all'
) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [chartData, setChartData] = useState<Array<{ name: string; [key: string]: number | string }>>([]);
  const { employees, fetchEmployees } = useEmployeeLoader();
  const { fetchSchedules } = useScheduleLoader();
  const { employeeStats, calculateStats } = useStatsCalculator();
  const { isLoading, setIsLoading, loadingState, setLoadingState } = useLoadingState();
  const [loadTimeout, setLoadTimeout] = useState(false);
  
  // Reset timeout when loading changes
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isLoading) {
      timer = setTimeout(() => {
        setLoadTimeout(true);
      }, 10000);
    } else if (timer) {
      clearTimeout(timer);
      setLoadTimeout(false);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading]);

  // Main data loading function
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Loading data for', currentYear, currentMonth, 'department:', selectedDepartment);

      // 1. Determine date range for the selected month
      const days = generateDaysInMonth(currentYear, currentMonth);
      const startDate = formatDate(days[0]);
      const endDate = formatDate(days[days.length - 1]);

      // 2. Load employees
      setLoadingState('loading-employees');
      const loadedEmployees = await fetchEmployees(selectedDepartment);
      
      if (loadedEmployees.length === 0) {
        toast.warning('No employees found');
        setIsLoading(false);
        setLoadingState('idle');
        return;
      }
      
      // 3. Load schedules
      setLoadingState('loading-schedules');
      const employeesWithSchedules = await fetchSchedules(loadedEmployees, startDate, endDate);
      
      // 4. Calculate statistics
      setLoadingState('calculating');
      calculateStats(employeesWithSchedules, currentYear, currentMonth, statusCodes);
      
      // 5. Filter chart data by department
      const filtered = filterChartDataByDepartment(employeeStats.chartData || [], selectedDepartment);
      setChartData(filtered);
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error loading statistics');
    } finally {
      setIsLoading(false);
      setLoadingState('idle');
    }
  }, [currentYear, currentMonth, statusCodes, selectedDepartment, fetchEmployees, fetchSchedules, calculateStats, setIsLoading, setLoadingState, employeeStats]);

  // Trigger data load when inputs change or refresh is requested
  useEffect(() => {
    loadData();
  }, [currentYear, currentMonth, statusCodes, selectedDepartment, refreshKey, loadData]);

  // Handle manual refresh
  const refreshData = useCallback(() => {
    setLoadTimeout(false);
    setRefreshKey(prev => prev + 1);
  }, []);
  
  // Realtime updates setup
  useEffect(() => {
    const handleForceReload = () => {
      console.log('Force reload triggered');
      refreshData();
    };
    
    window.addEventListener('forceStatisticsReload', handleForceReload);
    return () => {
      window.removeEventListener('forceStatisticsReload', handleForceReload);
    };
  }, [refreshData]);

  return {
    employeeStats,
    chartData,
    isLoading,
    loadTimeout,
    refreshData,
    loadingState
  };
};
