
export type StatusCode = 
  | 'present' 
  | 'absent' 
  | 'vacation' 
  | 'sick' 
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
  sickDays: number;
  trainingDays: number;
}

export const STATUS_LABELS: Record<StatusCode, string> = {
  present: 'Présent',
  absent: 'Absent',
  vacation: 'Congés',
  sick: 'Maladie',
  training: 'Formation',
  '': '-'
};

export const STATUS_COLORS: Record<StatusCode, string> = {
  present: 'bg-attendance-present text-attendance-present-foreground',
  absent: 'bg-attendance-absent text-attendance-absent-foreground',
  vacation: 'bg-attendance-vacation text-attendance-vacation-foreground',
  sick: 'bg-attendance-sick text-attendance-sick-foreground',
  training: 'bg-attendance-training text-attendance-training-foreground',
  '': 'bg-transparent text-foreground'
};
