
import { Employee, SummaryStats, StatusCode } from '@/types';
import { generateDaysInMonth, formatDate } from './dateUtils';

// Cache for previously calculated days in month
const daysInMonthCache = new Map<string, Date[]>();

// Cache for daily status results to avoid recalculations
const dailyStatusCache = new Map<string, { status: StatusCode, multiplier: number }>();

/**
 * Optimized function to generate or retrieve cached days for a month
 */
export const getCachedDaysInMonth = (year: number, month: number): Date[] => {
  const cacheKey = `${year}-${month}`;
  if (!daysInMonthCache.has(cacheKey)) {
    daysInMonthCache.set(cacheKey, generateDaysInMonth(year, month));
  }
  return daysInMonthCache.get(cacheKey)!;
};

/**
 * Calculates statistics for an employee in a specific month with optimized performance
 */
export const calculateEmployeeStats = (
  employee: Employee,
  year: number,
  month: number
): SummaryStats => {
  const days = getCachedDaysInMonth(year, month);
  const startDate = formatDate(days[0]);
  const endDate = formatDate(days[days.length - 1]);
  
  // Initialize stats object with zero values
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
    parcDays: 0,
    projectStats: {},
    employeeName: employee.name
  };
  
  // Quick exit if no schedule data
  if (!employee.schedule || employee.schedule.length === 0) {
    return stats;
  }
  
  // Filter relevant schedule entries first to reduce iteration
  const relevantSchedule = employee.schedule.filter(
    day => day.date >= startDate && day.date <= endDate
  );
  
  // Use optimized switch statement instead of if-else chains
  relevantSchedule.forEach(day => {
    const cacheKey = `${day.date}-${day.status}-${day.period}-${day.isHighlighted}`;
    let statusResult = dailyStatusCache.get(cacheKey);
    
    if (!statusResult) {
      const dayMultiplier = day.period === 'FULL' ? 1 : 0.5;
      statusResult = { status: day.status, multiplier: dayMultiplier };
      dailyStatusCache.set(cacheKey, statusResult);
    }
    
    const { status, multiplier } = statusResult;
    
    // Track project statistics if applicable
    if (status === 'projet' && day.projectCode) {
      stats.projectStats[day.projectCode] = (stats.projectStats[day.projectCode] || 0) + multiplier;
    }
    
    // Process highlighted days (permanence)
    if (day.isHighlighted) {
      stats.permanenceDays += multiplier;
      stats.presentDays += multiplier;
      return; // Skip further processing for this day
    }
    
    // Process by status using a switch statement for better performance
    switch(status) {
      case 'assistance':
        stats.presentDays += multiplier;
        break;
      case 'vigi':
        stats.presentDays += multiplier;
        stats.vigiDays += multiplier;
        break;
      case 'formation':
        stats.presentDays += multiplier;
        stats.trainingDays += multiplier;
        break;
      case 'projet':
        stats.presentDays += multiplier;
        stats.projectDays += multiplier;
        break;
      case 'conges':
        stats.vacationDays += multiplier;
        break;
      case 'management':
        stats.presentDays += multiplier;
        stats.managementDays += multiplier;
        break;
      case 'tp':
        stats.tpDays += multiplier;
        break;
      case 'coordinateur':
        stats.presentDays += multiplier;
        stats.coordinatorDays += multiplier;
        break;
      case 'absence':
        stats.absentDays += multiplier;
        stats.otherAbsenceDays += multiplier;
        break;
      case 'regisseur':
        stats.presentDays += multiplier;
        stats.regisseurDays += multiplier;
        break;
      case 'demenagement':
        stats.presentDays += multiplier;
        stats.demenagementDays += multiplier;
        break;
      case 'permanence':
        stats.presentDays += multiplier;
        stats.permanenceDays += multiplier;
        break;
      case 'parc':
        stats.presentDays += multiplier;
        stats.parcDays += multiplier;
        break;
    }
  });
  
  return stats;
};

// Optimized batch processing function that returns results immediately
export const calculateBatchEmployeeStats = (
  employees: Employee[],
  year: number,
  month: number,
  batchSize: number = 10
): SummaryStats[] => {
  const results: SummaryStats[] = [];
  
  // Process all employees immediately for small datasets
  if (employees.length <= batchSize) {
    employees.forEach(employee => {
      results.push(calculateEmployeeStats(employee, year, month));
    });
    return results;
  }
  
  // For larger datasets, process in batches but still return immediately
  for (let i = 0; i < employees.length; i += batchSize) {
    const batch = employees.slice(i, i + batchSize);
    batch.forEach(employee => {
      results.push(calculateEmployeeStats(employee, year, month));
    });
  }
  
  return results;
};

// Function to clear caches when needed
export const clearStatsCalculationCache = (): void => {
  daysInMonthCache.clear();
  dailyStatusCache.clear();
};
