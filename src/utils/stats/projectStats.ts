
import { DayCount } from './types';
import { SummaryStats } from '@/types';

/**
 * Updates project statistics in the stats object
 */
export const updateProjectStats = (
  stats: SummaryStats,
  day: DayCount
): void => {
  // If it's a project day with a project code, track it
  if (day.status === 'projet' && day.projectCode) {
    stats.projectStats[day.projectCode] = (stats.projectStats[day.projectCode] || 0) + day.dayMultiplier;
  }
};
