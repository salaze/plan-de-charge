
import { Employee, DayPeriod, StatusCode } from '@/types';

export interface PlanningGridProps {
  year: number;
  month: number;
  employees: Employee[];
  projects: { id: string; code: string; name: string; color: string }[];
  onStatusChange: (
    employeeId: string, 
    date: string, 
    status: StatusCode, 
    period: DayPeriod,
    isHighlighted?: boolean,
    projectCode?: string
  ) => void;
  isAdmin: boolean;
}

export interface VisibleDaysProps {
  days: Date[];
  visibleDays: Date[];
}

export interface CurrentStatusInfo {
  status: StatusCode; 
  isHighlighted: boolean;
  projectCode?: string;
}
