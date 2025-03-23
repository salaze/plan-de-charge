
export type StatusCode = 
  | 'assistance' 
  | 'absent' 
  | 'vacation' 
  | 'training' 
  | '';

export type DayPeriod = 'AM' | 'PM' | 'FULL';

export interface DayStatus {
  date: string; // YYYY-MM-DD
  status: StatusCode;
  period: DayPeriod;
  note?: string;
}

export interface Employee {
  id: string;
  name: string;
  position?: string;
  department?: string;
  schedule: DayStatus[];
}

export interface MonthData {
  year: number;
  month: number; // 0-11
  employees: Employee[];
}

export interface FilterOptions {
  employeeId?: string;
  statusCodes?: StatusCode[];
  startDate?: Date;
  endDate?: Date;
}

export interface SummaryStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  vacationDays: number;
  trainingDays: number;
}

export const STATUS_LABELS: Record<StatusCode, string> = {
  assistance: 'Assistance',
  absent: 'Absent',
  vacation: 'Congés',
  training: 'Formation',
  '': '-'
};

export const STATUS_COLORS: Record<StatusCode, string> = {
  assistance: 'bg-attendance-present text-attendance-present-foreground',
  absent: 'bg-attendance-absent text-attendance-absent-foreground',
  vacation: 'bg-attendance-vacation text-attendance-vacation-foreground',
  training: 'bg-attendance-training text-attendance-training-foreground',
  '': 'bg-transparent text-foreground'
};
