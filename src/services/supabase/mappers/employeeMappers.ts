
import { Employee, DayStatus } from "@/types";

// Types pour Supabase
export type SupabaseEmployee = {
  id: string;
  nom: string;
  prenom: string | null;
  uid: string | null;
  fonction: string | null;
  departement: string | null;
  role: string | null;
  password: string | null;
};

export type SupabaseSchedule = {
  id: string;
  employe_id: string;
  date: string;
  statut_code: string;
  period: string;
  note: string | null;
  project_code: string | null;
  is_highlighted: boolean | null;
};

// Convertisseurs de types pour les employés
export const mapSupabaseEmployeeToEmployee = (employee: SupabaseEmployee, schedule: SupabaseSchedule[] = []): Employee => {
  // Convertir le planning Supabase au format de l'application
  const mappedSchedule: DayStatus[] = schedule.map(item => ({
    date: item.date,
    status: item.statut_code,
    period: item.period as 'AM' | 'PM' | 'FULL',
    note: item.note || undefined,
    projectCode: item.project_code || undefined,
    isHighlighted: item.is_highlighted || false
  }));

  return {
    id: employee.id,
    name: employee.nom + (employee.prenom ? ` ${employee.prenom}` : ''),
    uid: employee.uid || undefined,
    position: employee.fonction || undefined,
    department: employee.departement || undefined,
    role: (employee.role as 'admin' | 'employee') || 'employee',
    password: employee.password || undefined,
    schedule: mappedSchedule
  };
};

// Conversion d'Employee vers SupabaseEmployee
export const mapEmployeeToSupabaseEmployee = (employee: Employee): Omit<SupabaseEmployee, "id"> => {
  // Extraire prénom du nom complet si possible
  let nom = employee.name;
  let prenom: string | null = null;
  
  const nameParts = employee.name.split(' ');
  if (nameParts.length > 1) {
    nom = nameParts[0];
    prenom = nameParts.slice(1).join(' ');
  }

  return {
    nom,
    prenom,
    uid: employee.uid || null,
    fonction: employee.position || null,
    departement: employee.department || null,
    role: employee.role || 'employee',
    password: employee.password || null
  };
};

// Conversion de DayStatus vers SupabaseSchedule
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
