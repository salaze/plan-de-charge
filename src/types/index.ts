export type StatusCode = 
  | 'assistance' 
  | 'vigi'
  | 'formation'
  | 'projet'
  | 'conges'
  | 'management'
  | 'tp'
  | 'coordinateur'
  | 'absence'
  | 'regisseur'
  | 'demenagement'
  | 'permanence'
  | 'parc'       // Ajout du statut "Gestion de Parc"
  | 'none'
  | '';

export type DayPeriod = 'AM' | 'PM' | 'FULL';

export interface DayStatus {
  date: string; // YYYY-MM-DD
  status: StatusCode;
  period: DayPeriod;
  note?: string;
  projectCode?: string;
  isHighlighted?: boolean;
}

export type UserRole = 'admin' | 'administrateur' | 'employee';

export interface Employee {
  id: string;
  name: string;
  uid?: string;
  email?: string;
  position?: string;
  department?: string;
  role?: UserRole;
  password?: string;
  schedule: DayStatus[];
}

export interface Project {
  id: string;
  code: string;
  name: string;
  color: string;
}

export interface MonthData {
  year: number;
  month: number; // 0-11
  employees: Employee[];
  projects: Project[];
}

export interface FilterOptions {
  employeeId?: string;
  statusCodes?: StatusCode[];
  projectCode?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface SummaryStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  vacationDays: number;
  trainingDays: number;
  managementDays: number;
  projectDays: number;
  vigiDays: number;
  tpDays: number;
  coordinatorDays: number;
  otherAbsenceDays: number;
  regisseurDays: number;
  demenagementDays: number;
  permanenceDays: number;
  parcDays: number;
  projectStats: Record<string, number>;
  employeeName?: string;
}

export const STATUS_LABELS: Record<StatusCode, string> = {
  assistance: 'Assistance',
  vigi: 'Vigi',
  formation: 'Formation',
  projet: 'Projet',
  conges: 'Congés',
  management: 'Management',
  tp: 'Temps Partiel',
  coordinateur: 'Coordinateur Vigi Ticket',
  absence: 'Autre Absence',
  regisseur: 'Régisseur',
  demenagement: 'Déménagements',
  permanence: 'Permanences',
  parc: 'Gestion de Parc',  // Ajout du label pour "Gestion de Parc"
  none: 'Aucun',
  '': '-'
};

export const STATUS_COLORS: Record<StatusCode, string> = {
  assistance: 'bg-yellow-300 text-yellow-800',
  vigi: 'bg-red-500 text-white',
  formation: 'bg-blue-500 text-white',
  projet: 'bg-green-500 text-white',
  conges: 'bg-amber-800 text-white',
  management: 'bg-purple-500 text-white',
  tp: 'bg-gray-400 text-gray-800',
  coordinateur: 'bg-green-600 text-white',
  absence: 'bg-pink-300 text-pink-800',
  regisseur: 'bg-blue-300 text-blue-800',
  demenagement: 'bg-indigo-500 text-white',
  permanence: 'bg-pink-600 text-white',
  parc: 'bg-teal-500 text-white',  // Ajout d'une couleur pour "Gestion de Parc"
  none: 'bg-transparent text-foreground',
  '': 'bg-transparent text-foreground'
};
