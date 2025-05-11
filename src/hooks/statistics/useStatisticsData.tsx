
import { StatusCode } from '@/types';
import { useEnhancedStatistics } from './useEnhancedStatistics';

export const useStatisticsData = (
  currentYear: number,
  currentMonth: number,
  statusCodes: StatusCode[],
  selectedDepartment: string = 'all'
) => {
  // Use the enhanced statistics hook which combines all our logic
  return useEnhancedStatistics(currentYear, currentMonth, statusCodes, selectedDepartment);
};
