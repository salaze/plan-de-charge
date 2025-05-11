
import { useState, useCallback, useEffect, useMemo } from 'react';
import { StatusCode } from '@/types';
import { useEmployeeLoader } from './useEmployeeLoader';
import { useScheduleLoader } from './useScheduleLoader';
import { useStatsCalculator } from './useStatsCalculator';
import { useLoadingState } from './useLoadingState';
import { filterChartDataByDepartment } from '@/utils/departmentUtils';
import { generateDaysInMonth, formatDate } from '@/utils/dateUtils';
import { toast } from 'sonner';

export const useEmployeeStatistics = (
  currentYear: number,
  currentMonth: number,
  statusCodes: StatusCode[],
  selectedDepartment: string = 'all',
  refreshTrigger: number = 0
) => {
  const { employees, fetchEmployees } = useEmployeeLoader();
  const { fetchSchedules } = useScheduleLoader();
  const { employeeStats, chartData: originalChartData, calculateStats } = useStatsCalculator();
  const { isLoading, setIsLoading, loadingState, setLoadingState } = useLoadingState();
  const [chartData, setChartData] = useState<Array<{ name: string; [key: string]: number | string }>>([]);
  
  // Cache for optimizing renders
  const cacheKey = useMemo(() => 
    `${currentYear}-${currentMonth}-${selectedDepartment}-${refreshTrigger}`, 
    [currentYear, currentMonth, selectedDepartment, refreshTrigger]
  );

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
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Loading data for', currentYear, currentMonth, 'department:', selectedDepartment);

      // 1. Determine date range for the selected month
      const days = generateDaysInMonth(currentYear, currentMonth);
      const startDate = formatDate(days[0]);
      const endDate = formatDate(days[days.length - 1]);
      console.log(`Period: ${startDate} to ${endDate}`);

      // 2. Load employees
      setLoadingState('loading-employees');
      const loadedEmployees = await fetchEmployees('all');
      
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
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error loading statistics');
    } finally {
      setIsLoading(false);
      setLoadingState('idle');
    }
  }, [currentYear, currentMonth, statusCodes, selectedDepartment, fetchEmployees, fetchSchedules, calculateStats, setIsLoading, setLoadingState]);

  // Run data loading when inputs change
  useEffect(() => {
    loadData();
  }, [cacheKey, loadData]);

  return {
    chartData,
    employeeStats,
    isLoading,
    loadingState,
    loadData, // Exposed to allow manual refresh
  };
};
