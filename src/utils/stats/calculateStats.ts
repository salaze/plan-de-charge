
import { Employee, SummaryStats, StatusCode } from '@/types';
import { generateDaysInMonth, formatDate } from '../dateUtils';
import { DayCount } from './types';
import { updateProjectStats } from './projectStats';

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
  
  // Initialize counters with default values
  const stats: SummaryStats = {
    totalDays: days.length,
    presentDays: 0,
    absentDays: 0,
    vacationDays: 0,
    trainingDays: 0,
    managementDays: 0,
    projectDays: 0,
    vigiDays: 0,
    tpDays: 0,
    coordinatorDays: 0,
    otherAbsenceDays: 0,
    regisseurDays: 0,
    demenagementDays: 0,
    permanenceDays: 0,
    projectStats: {},
    employeeName: employee.name
  };
  
  // Count each day type
  relevantSchedule.forEach(day => {
    const dayCount: DayCount = {
      dayMultiplier: day.period === 'FULL' ? 1 : 0.5,
      status: day.status,
      projectCode: day.projectCode,
      isHighlighted: day.isHighlighted
    };
    
    // Update project stats if applicable
    updateProjectStats(stats, dayCount);
    
    // If it's a highlighted day (permanence)
    if (day.isHighlighted) {
      stats.permanenceDays += dayCount.dayMultiplier;
      stats.presentDays += dayCount.dayMultiplier;
    } else {
      updateDayTypeStats(stats, dayCount);
    }
  });
  
  return stats;
};

/**
 * Updates the appropriate day type counters based on status
 */
const updateDayTypeStats = (stats: SummaryStats, day: DayCount): void => {
  switch(day.status) {
    case 'assistance':
      stats.presentDays += day.dayMultiplier;
      break;
    case 'vigi':
      stats.presentDays += day.dayMultiplier;
      stats.vigiDays += day.dayMultiplier;
      break;
    case 'formation':
      stats.presentDays += day.dayMultiplier;
      stats.trainingDays += day.dayMultiplier;
      break;
    case 'projet':
      stats.presentDays += day.dayMultiplier;
      stats.projectDays += day.dayMultiplier;
      break;
    case 'conges':
      stats.vacationDays += day.dayMultiplier;
      break;
    case 'management':
      stats.presentDays += day.dayMultiplier;
      stats.managementDays += day.dayMultiplier;
      break;
    case 'tp':
      stats.tpDays += day.dayMultiplier;
      break;
    case 'coordinateur':
      stats.presentDays += day.dayMultiplier;
      stats.coordinatorDays += day.dayMultiplier;
      break;
    case 'absence':
      stats.absentDays += day.dayMultiplier;
      stats.otherAbsenceDays += day.dayMultiplier;
      break;
    case 'regisseur':
      stats.presentDays += day.dayMultiplier;
      stats.regisseurDays += day.dayMultiplier;
      break;
    case 'demenagement':
      stats.presentDays += day.dayMultiplier;
      stats.demenagementDays += day.dayMultiplier;
      break;
    case 'permanence':
      stats.presentDays += day.dayMultiplier;
      stats.permanenceDays += day.dayMultiplier;
      break;
  }
};
