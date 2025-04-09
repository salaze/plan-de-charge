
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

export interface Status {
  code: StatusCode;
  label: string;
  color: string;
  displayOrder?: number;
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
