
import { MonthData, FilterOptions, Employee } from '@/types';
import { formatDate } from './dateUtils';

/**
 * Filters data based on provided filter options
 */
export const filterData = (data: MonthData, filters: FilterOptions): MonthData => {
  let filteredEmployees = [...data.employees];
  
  // Filter by employee if specified
  if (filters.employeeId) {
    filteredEmployees = filteredEmployees.filter(emp => emp.id === filters.employeeId);
  }
  
  // Filter by status codes if specified
  if (filters.statusCodes && filters.statusCodes.length > 0) {
    filteredEmployees = filteredEmployees.map(employee => {
      const filteredSchedule = employee.schedule.filter(day => 
        filters.statusCodes?.includes(day.status)
      );
      
      return {
        ...employee,
        schedule: filteredSchedule
      };
    });
  }
  
  // Filter by date range if specified
  if (filters.startDate || filters.endDate) {
    filteredEmployees = filteredEmployees.map(employee => {
      let filteredSchedule = [...employee.schedule];
      
      if (filters.startDate) {
        const startDateStr = formatDate(filters.startDate);
        filteredSchedule = filteredSchedule.filter(day => day.date >= startDateStr);
      }
      
      if (filters.endDate) {
        const endDateStr = formatDate(filters.endDate);
        filteredSchedule = filteredSchedule.filter(day => day.date <= endDateStr);
      }
      
      return {
        ...employee,
        schedule: filteredSchedule
      };
    });
  }
  
  return {
    ...data,
    employees: filteredEmployees
  };
};
