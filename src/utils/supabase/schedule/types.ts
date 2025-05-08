
import { DayStatus } from '@/types';

export interface ScheduleEntry {
  id?: string;
  employe_id: string;
  date: string;
  statut_code: string;
  period: string;
  note?: string | null;
  project_code?: string | null;
  is_highlighted?: boolean;
}

export interface ScheduleResponse {
  success: boolean;
  data?: any;
  error?: any;
}
