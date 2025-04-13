
import { StatusCode } from './index';
import { SupabaseTable } from './supabase';

// Define interfaces for the table data structures
export interface StatutData {
  id?: string;
  code: string;
  libelle: string;
  couleur: string;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeData {
  id?: string;
  nom: string;
  prenom?: string;
  departement?: string;
  fonction?: string;
  role?: string;
  uid?: string;
  identifiant?: string;  // Added identifiant property
  created_at?: string;
  updated_at?: string;
}

export interface ScheduleData {
  id?: string;
  employe_id?: string;
  date: string;
  period: string;
  statut_code: StatusCode;
  project_code?: string;
  is_highlighted?: boolean;
  note?: string;
  created_at?: string;
}

export interface TacheData {
  id?: string;
  created_at: string;
}

// Add the missing ConnectionLogData interface
export interface ConnectionLogData {
  id?: string;
  event_type: string;
  user_id?: string;
  user_name?: string;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

// Define a simple interface for the return type of sync functions
export interface SyncResult {
  success: boolean;
  data?: any;
  error?: any;
}

// Type guard functions for validating data
export function isValidStatut(data: any): data is StatutData {
  return data && 
         typeof data.code === 'string' && 
         typeof data.libelle === 'string' && 
         typeof data.couleur === 'string';
}

export function isValidEmploye(data: any): data is EmployeData {
  return data && typeof data.nom === 'string';
}

export function isValidSchedule(data: any): data is ScheduleData {
  return data && 
         typeof data.date === 'string' && 
         typeof data.period === 'string' && 
         typeof data.statut_code === 'string';
}

// Create mapped type for table data types
export type TableDataType = {
  'statuts': StatutData;
  'employes': EmployeData;
  'employe_schedule': ScheduleData;
  'taches': TacheData;
}

// Define an explicit mapping for TableDataTypes
export type TableDataTypes<T extends SupabaseTable> = TableDataType[T];
