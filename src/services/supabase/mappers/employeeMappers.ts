
import { Employee, DayStatus } from "@/types";

export type SupabaseEmployee = {
  id: string;
  nom: string;
  prenom?: string;
  uid?: string;
  fonction?: string;
  departement?: string;
  password?: string;
  role?: string;
};

export type SupabaseSchedule = {
  id: string;
  employe_id: string;
  date: string;
  statut_code: string;
  period: string;
  note?: string;
  project_code?: string;
  is_highlighted?: boolean;
};

export const mapSupabaseEmployeeToEmployee = (
  employee: SupabaseEmployee,
  schedules: SupabaseSchedule[] = []
): Employee => {
  return {
    id: employee.id,
    name: employee.nom + (employee.prenom ? ` ${employee.prenom}` : ''),
    uid: employee.uid,
    position: employee.fonction,
    department: employee.departement,
    password: employee.password,
    role: employee.role as any,
    schedule: schedules.map(s => ({
      date: s.date,
      status: s.statut_code,
      period: s.period as 'AM' | 'PM' | 'FULL',
      projectCode: s.project_code,
      projectId: s.project_code, // For backwards compatibility
      isHighlighted: s.is_highlighted,
      highlight: s.is_highlighted, // For backwards compatibility
      note: s.note
    }))
  };
};

export const mapEmployeeToSupabaseEmployee = (employee: Employee): SupabaseEmployee => {
  // Extract first name and last name if possible
  let nom = employee.name;
  let prenom: string | undefined;
  
  const nameParts = employee.name.split(' ');
  if (nameParts.length > 1) {
    nom = nameParts[0];
    prenom = nameParts.slice(1).join(' ');
  }

  return {
    id: employee.id,
    nom: nom,
    prenom: prenom,
    uid: employee.uid,
    fonction: employee.position,
    departement: employee.department,
    password: employee.password,
    role: employee.role
  };
};

export const mapDayStatusToSupabaseSchedule = (
  employeeId: string, 
  dayStatus: DayStatus
): Omit<SupabaseSchedule, "id"> => {
  return {
    employe_id: employeeId,
    date: dayStatus.date,
    statut_code: dayStatus.status,
    period: dayStatus.period,
    note: dayStatus.note || null,
    project_code: dayStatus.projectCode || null,
    is_highlighted: dayStatus.isHighlighted || false
  };
};
