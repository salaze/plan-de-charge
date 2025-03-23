
import { Employee, SummaryStats } from '@/types';
import { generateDaysInMonth, formatDate } from './dateUtils';

/**
 * Calculates statistics for an employee in a specific month
 */
export const calculateEmployeeStats = (
  employee: Employee,
  year: number,
  month: number
): SummaryStats => {
  const days = generateDaysInMonth(year, month);
  const startDate = formatDate(days[0]);
  const endDate = formatDate(days[days.length - 1]);
  
  const relevantSchedule = employee.schedule.filter(
    day => day.date >= startDate && day.date <= endDate
  );
  
  // Initialize counters
  const stats: SummaryStats = {
    totalDays: days.length,
    presentDays: 0,
    absentDays: 0,
    vacationDays: 0,
    trainingDays: 0
  };
  
  // Count each type of day
  relevantSchedule.forEach(day => {
    const dayMultiplier = day.period === 'FULL' ? 1 : 0.5;
    
    switch(day.status) {
      case 'assistance':
        stats.presentDays += dayMultiplier;
        break;
      case 'absent':
        stats.absentDays += dayMultiplier;
        break;
      case 'vacation':
        stats.vacationDays += dayMultiplier;
        break;
      case 'training':
        stats.trainingDays += dayMultiplier;
        break;
    }
  });
  
  return stats;
};
