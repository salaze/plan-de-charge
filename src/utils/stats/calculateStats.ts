
import { Employee, Status, DateRange } from '@/types';
import { SummaryStats } from '@/types';

export const calculateEmployeeStats = (
  employee: Employee,
  dateRange: DateRange,
  statuses: Status[]
): SummaryStats => {
  // Initialize the stats object with proper structure
  const stats: SummaryStats = {
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    vacationDays: 0,
    trainingDays: 0,
    managementDays: 0,
    projectDays: 0,
    vigiDays: 0,
    tpDays: 0,
    coordinatorDays: 0,
    otherDays: 0,
    presencePct: 0,
    employeeName: employee.name,
    // Add these missing properties
    byStatus: {},
    byProject: {},
    highlighted: 0,
    total: 0
  };
  
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    stats.totalDays++;

    const dateStr = currentDate.toISOString().split('T')[0];
    const scheduleEntry = employee.schedule.find(entry => entry.date === dateStr);

    if (scheduleEntry) {
      const status = statuses.find(s => s.code === scheduleEntry.status);

      if (status) {
        if (!stats.byStatus[status.code]) {
          stats.byStatus[status.code] = 0;
        }
        stats.byStatus[status.code]++;

        switch (status.code) {
          case 'PRESENT':
            stats.presentDays++;
            break;
          case 'ABSENT':
            stats.absentDays++;
            break;
          case 'VACATION':
            stats.vacationDays++;
            break;
          case 'TRAINING':
            stats.trainingDays++;
            break;
          case 'MANAGEMENT':
            stats.managementDays++;
            break;
          case 'VIGI':
            stats.vigiDays++;
            break;
          case 'TP':
            stats.tpDays++;
            break;
          case 'COORDINATOR':
            stats.coordinatorDays++;
            break;
          default:
            stats.otherDays++;
            break;
        }
      }

      if (scheduleEntry.projectId) {
        if (!stats.byProject[scheduleEntry.projectId]) {
          stats.byProject[scheduleEntry.projectId] = 0;
        }
        stats.byProject[scheduleEntry.projectId]++;
        stats.projectDays++;
      }

      if (scheduleEntry.isHighlighted) {
        stats.highlighted++;
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  stats.total = stats.presentDays + stats.absentDays + stats.vacationDays + stats.trainingDays + stats.managementDays + stats.projectDays + stats.vigiDays + stats.tpDays + stats.coordinatorDays + stats.otherDays;
  stats.presencePct = stats.totalDays > 0 ? (stats.presentDays / stats.totalDays) * 100 : 0;

  return stats;
};
