
import { Employee, SummaryStats, StatusCode } from '@/types';
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
  
  // Initialiser les compteurs avec des valeurs par défaut
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
    projectStats: {}
  };
  
  // Compter chaque type de jour
  relevantSchedule.forEach(day => {
    const dayMultiplier = day.period === 'FULL' ? 1 : 0.5;
    
    // Suivre les projets spécifiques
    if (day.status === 'projet' && day.projectCode) {
      stats.projectStats[day.projectCode] = (stats.projectStats[day.projectCode] || 0) + dayMultiplier;
    }
    
    switch(day.status) {
      case 'assistance':
        stats.presentDays += dayMultiplier;
        break;
      case 'vigi':
        stats.presentDays += dayMultiplier;
        stats.vigiDays += dayMultiplier;
        break;
      case 'formation':
        stats.presentDays += dayMultiplier;
        stats.trainingDays += dayMultiplier;
        break;
      case 'projet':
        stats.presentDays += dayMultiplier;
        stats.projectDays += dayMultiplier;
        break;
      case 'conges':
        stats.vacationDays += dayMultiplier;
        break;
      case 'management':
        stats.presentDays += dayMultiplier;
        stats.managementDays += dayMultiplier;
        break;
      case 'tp':
        stats.tpDays += dayMultiplier;
        break;
      case 'coordinateur':
        stats.presentDays += dayMultiplier;
        stats.coordinatorDays += dayMultiplier;
        break;
      case 'absence':
        stats.absentDays += dayMultiplier;
        stats.otherAbsenceDays += dayMultiplier;
        break;
      case 'regisseur':
        stats.presentDays += dayMultiplier;
        stats.regisseurDays += dayMultiplier;
        break;
      case 'demenagement':
        stats.presentDays += dayMultiplier;
        stats.demenagementDays += dayMultiplier;
        break;
    }
  });
  
  return stats;
};
