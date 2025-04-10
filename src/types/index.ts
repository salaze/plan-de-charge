export type UserRole = 'admin' | 'employee';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  departmentId?: string;
  email?: string;
}

export interface Department {
  id: string;
  name: string;
  color?: string;
}

export interface Employee {
  id: string;
  name: string;
  email?: string;
  position?: string;
  departmentId?: string;
  role?: UserRole;
  password?: string;
  schedule: Schedule[];
  createdAt?: string;
  color?: string;
  // These are compatibility fields for existing code
  uid?: string;
  department?: string;
}

export type StatusCode = 
  | 'present'
  | 'absent'
  | 'vacation'
  | 'sick'
  | 'training'
  | 'remote'
  | 'mission'
  | 'project'
  | string;

export type DayPeriod = 'AM' | 'PM' | 'FULL';

export interface Schedule {
  date: string; // YYYY-MM-DD
  status: StatusCode;
  period: DayPeriod;
  note?: string;
  projectId?: string;
  highlight?: boolean;
  // Compatibility fields
  projectCode?: string;
  isHighlighted?: boolean;
}

export interface Status {
  id?: string;
  code: StatusCode;
  label: string;
  color: string;
  displayOrder?: number;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  color: string;
  clientId?: string;
  startDate?: string;
  endDate?: string;
  status?: 'active' | 'completed' | 'planned';
}

export interface Client {
  id: string;
  name: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export type DayStatus = Schedule;

export interface ConnectionLog {
  id: string;
  userId?: string;
  user_id?: string;
  userName?: string;
  user_name?: string;
  eventType?: string;
  event_type?: string;
  createdAt?: string;
  created_at?: string;
  ipAddress?: string;
  ip_address?: string;
  userAgent?: string;
  user_agent?: string;
}

export interface MonthData {
  year: number;
  month: number;
  employees: Employee[];
  projects: Project[];
}

export interface FilterOptions {
  departments: string[];
  statuses: string[];
  projects: string[];
  employees: string[];
  statusCodes?: string[];
  employeeId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface SummaryStats {
  byStatus: Record<string, number>;
  byProject: Record<string, number>;
  highlighted: number;
  total: number;
  // Additional properties used in statistics
  employeeName?: string;
  totalDays?: number;
  presentDays?: number;
  absentDays?: number;
  vacationDays?: number;
  trainingDays?: number;
  managementDays?: number;
  projectDays?: number;
  vigiDays?: number;
  tpDays?: number;
  coordinatorDays?: number;
  otherAbsenceDays?: number;
  regisseurDays?: number;
  demenagementDays?: number;
  permanenceDays?: number;
  projectStats?: Record<string, number>;
}

// Constants for status colors and labels
export const STATUS_COLORS: Record<string, string> = {
  present: 'bg-green-500 text-white',
  absent: 'bg-red-500 text-white',
  vacation: 'bg-blue-500 text-white',
  sick: 'bg-yellow-500 text-black',
  training: 'bg-purple-500 text-white',
  remote: 'bg-teal-500 text-white',
  mission: 'bg-indigo-500 text-white',
  project: 'bg-orange-500 text-white',
};

export const STATUS_LABELS: Record<string, string> = {
  present: 'Présent',
  absent: 'Absent',
  vacation: 'Congés',
  sick: 'Maladie',
  training: 'Formation',
  remote: 'Télétravail',
  mission: 'Mission',
  project: 'Projet',
};
