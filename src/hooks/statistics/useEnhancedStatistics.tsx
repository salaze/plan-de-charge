
import { useCallback, useState } from 'react';
import { StatusCode } from '@/types';
import { useEmployeeStatistics } from './useEmployeeStatistics';
import { useLoadingTimeout } from './useLoadingTimeout';
import { useRealtimeUpdates } from './useRealtimeUpdates';

export const useEnhancedStatistics = (
  currentYear: number,
  currentMonth: number,
  statusCodes: StatusCode[],
  selectedDepartment: string = 'all'
) => {
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Set up statistics with refresh key
  const {
    chartData,
    employeeStats,
    isLoading,
    loadingState,
    loadData
  } = useEmployeeStatistics(currentYear, currentMonth, statusCodes, selectedDepartment, refreshKey);

  // Set up timeout detection
  const { loadTimeout } = useLoadingTimeout({ isLoading });

  // Handle manual refresh
  const refreshData = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  // Set up realtime updates
  useRealtimeUpdates(refreshData);

  // Detailed loading state for debugging
  const loadingDetails = {
    state: loadingState,
    employeesCount: employeeStats.length,
    statusCodesCount: statusCodes.length,
    chartDataCount: chartData.length,
    selectedDepartment,
    loadTimeout
  };

  return {
    employeeStats,
    chartData,
    isLoading,
    loadTimeout,
    loadingDetails,
    refreshData,
    loadingState
  };
};
