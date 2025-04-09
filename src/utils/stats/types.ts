
import { SummaryStats } from '@/types';

// Specific types for statistics calculations
export interface DayCount {
  dayMultiplier: number;
  status: string;
  projectCode?: string;
  isHighlighted?: boolean;
}
