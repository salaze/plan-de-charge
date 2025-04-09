import { supabase } from "@/integrations/supabase/client";
import { Employee, Status, DayStatus } from "@/types";
import { generateId } from "@/utils";

// Types pour Supabase
type SupabaseStatus = {
  id: string;
  code: string;
  libelle: string;
  couleur: string;
  display_order: number;
};

type SupabaseEmployee = {
  id: string;
  nom: string;
  prenom: string | null;
  uid: string | null;
  fonction: string | null;
  departement: string | null;
  role: string | null;
  password: string | null;
};

type SupabaseSchedule = {
  id: string;
  employe_id: string;
  date: string;
  statut_code: string;
  period: string;
  note: string | null;
  project_code: string | null;
  is_highlighted: boolean | null;
};

// Convertisseurs de types
const mapSupabaseStatusToStatus = (status: SupabaseStatus): Status => {
  return {
    id: status.id,
    code: status.code,
    label: status.libelle,
    color: status.couleur,
    displayOrder: status.display_order
  };
};

const mapStatusToSupabaseStatus = (status: Status): Omit<SupabaseStatus, "id"> => {
  return {
    code: status.code,
    libelle: status.label,
    couleur: status.color,
    display_order: status.displayOrder || 0
  };
};

const mapSupabaseEmployeeToEmployee = (employee: SupabaseEmployee, schedule: SupabaseSchedule[] = []): Employee => {
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

const mapEmployeeToSupabaseEmployee = (employee: Employee): Omit<SupabaseEmployee, "id"> => {
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

const mapDayStatusToSupabaseSchedule = (
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

// Service pour les statuts
export const statusService = {
  async getAll(): Promise<Status[]> {
    try {
      const { data, error } = await supabase
        .from('statuts')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des statuts:', error);
        return [];
      }

      return (data as unknown as SupabaseStatus[]).map(mapSupabaseStatusToStatus);
    } catch (error) {
      console.error('Erreur non gérée:', error);
      return [];
    }
  },

  async create(status: Omit<Status, 'id'>): Promise<Status | null> {
    try {
      const supabaseStatus = mapStatusToSupabaseStatus(status as Status);
      const { data, error } = await supabase
        .from('statuts')
        .insert(supabaseStatus as any)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création du statut:', error);
        return null;
      }

      return mapSupabaseStatusToStatus(data as unknown as SupabaseStatus);
    } catch (error) {
      console.error('Erreur non gérée:', error);
      return null;
    }
  },

  async update(status: Status): Promise<Status | null> {
    try {
      const supabaseStatus = mapStatusToSupabaseStatus(status);
      const { data, error } = await supabase
        .from('statuts')
        .update(supabaseStatus as any)
        .eq('id', status.id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        return null;
      }

      return mapSupabaseStatusToStatus(data as unknown as SupabaseStatus);
    } catch (error) {
      console.error('Erreur non gérée:', error);
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('statuts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression du statut:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur non gérée:', error);
      return false;
    }
  }
};

// Service pour les employés
export const employeeService = {
  async getAll(): Promise<Employee[]> {
    try {
      // Récupérer tous les employés
      const { data: employees, error: employeesError } = await supabase
        .from('employes')
        .select('*');

      if (employeesError) {
        console.error('Erreur lors de la récupération des employés:', employeesError);
        return [];
      }

      console.log('Employees data from Supabase:', employees);

      // Si aucun employé n'est trouvé dans Supabase, retourner un tableau vide
      if (!employees || employees.length === 0) {
        console.warn('Aucun employé trouvé dans la base de données Supabase');
        return [];
      }

      // Récupérer tous les plannings
      const { data: schedules, error: schedulesError } = await supabase
        .from('employe_schedule')
        .select('*');

      if (schedulesError) {
        console.error('Erreur lors de la récupération des plannings:', schedulesError);
        // Si on ne peut pas récupérer les plannings, retourner les employés sans planning
        return (employees as unknown as SupabaseEmployee[]).map(employee => 
          mapSupabaseEmployeeToEmployee(employee, [])
        );
      }

      // Convertir et associer les données
      const mappedEmployees = (employees as unknown as SupabaseEmployee[]).map(employee => {
        const employeeSchedules = (schedules as unknown as SupabaseSchedule[])?.filter(
          schedule => schedule.employe_id === employee.id
        ) || [];
        return mapSupabaseEmployeeToEmployee(employee, employeeSchedules);
      });

      console.log('Mapped employees:', mappedEmployees);
      return mappedEmployees;
    } catch (error) {
      console.error('Erreur non gérée dans employeeService.getAll():', error);
      return [];
    }
  },

  async create(employee: Omit<Employee, 'id' | 'schedule'>): Promise<Employee | null> {
    try {
      const supabaseEmployee = mapEmployeeToSupabaseEmployee({
        ...employee, 
        id: generateId(), 
        schedule: []
      });

      const { data, error } = await supabase
        .from('employes')
        .insert(supabaseEmployee as any)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création de l\'employé:', error);
        return null;
      }

      return mapSupabaseEmployeeToEmployee(data as unknown as SupabaseEmployee);
    } catch (error) {
      console.error('Erreur non gérée:', error);
      return null;
    }
  },

  async update(employee: Employee): Promise<Employee | null> {
    try {
      const supabaseEmployee = mapEmployeeToSupabaseEmployee(employee);
      const { data, error } = await supabase
        .from('employes')
        .update(supabaseEmployee as any)
        .eq('id', employee.id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour de l\'employé:', error);
        return null;
      }

      return mapSupabaseEmployeeToEmployee(data as unknown as SupabaseEmployee);
    } catch (error) {
      console.error('Erreur non gérée:', error);
      return null;
    }
  },

  async updateRole(employeeId: string, role: 'admin' | 'employee'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('employes')
        .update({ role } as any)
        .eq('id', employeeId);

      if (error) {
        console.error('Erreur lors de la mise à jour du rôle:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur non gérée:', error);
      return false;
    }
  },

  async updatePassword(employeeId: string, password: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('employes')
        .update({ password } as any)
        .eq('id', employeeId);

      if (error) {
        console.error('Erreur lors de la mise à jour du mot de passe:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur non gérée:', error);
      return false;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      // Supprimer l'employé (la suppression en cascade supprimera aussi son planning)
      const { error } = await supabase
        .from('employes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression de l\'employé:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur non gérée:', error);
      return false;
    }
  },

  async updateStatus(employeeId: string, dayStatus: DayStatus): Promise<boolean> {
    try {
      const supabaseSchedule = mapDayStatusToSupabaseSchedule(employeeId, dayStatus);
      
      // Vérifier si l'entrée existe déjà
      const { data: existingEntries, error: fetchError } = await supabase
        .from('employe_schedule')
        .select('id')
        .eq('employe_id', employeeId)
        .eq('date', dayStatus.date)
        .eq('period', dayStatus.period);
        
      if (fetchError) {
        console.error('Erreur lors de la vérification de l\'entrée existante:', fetchError);
        return false;
      }
      
      // Si le statut est vide, supprimer l'entrée
      if (!dayStatus.status) {
        if (existingEntries && existingEntries.length > 0) {
          const { error: deleteError } = await supabase
            .from('employe_schedule')
            .delete()
            .eq('id', (existingEntries[0] as any).id);
            
          if (deleteError) {
            console.error('Erreur lors de la suppression du statut:', deleteError);
            return false;
          }
        }
        return true;
      }

      // Mise à jour ou insertion selon le cas
      if (existingEntries && existingEntries.length > 0) {
        const { error: updateError } = await supabase
          .from('employe_schedule')
          .update(supabaseSchedule as any)
          .eq('id', (existingEntries[0] as any).id);
          
        if (updateError) {
          console.error('Erreur lors de la mise à jour du statut:', updateError);
          return false;
        }
      } else {
        const { error: insertError } = await supabase
          .from('employe_schedule')
          .insert(supabaseSchedule as any);
          
        if (insertError) {
          console.error('Erreur lors de l\'ajout du statut:', insertError);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Erreur non gérée:', error);
      return false;
    }
  }
};

// Fonction pour migrer les données du localStorage vers Supabase
export const migrateLocalDataToSupabase = async (): Promise<boolean> => {
  try {
    const planningData = localStorage.getItem('planningData');
    if (!planningData) {
      console.log('Aucune donnée locale à migrer');
      return true;
    }
    
    const data = JSON.parse(planningData);
    
    // Migrer les statuts
    if (data.statuses && data.statuses.length > 0) {
      for (const status of data.statuses) {
        const supabaseStatus = {
          code: status.code,
          libelle: status.label,
          couleur: status.color,
          display_order: status.displayOrder || 0
        };
        
        const { error } = await supabase
          .from('statuts')
          .insert(supabaseStatus as any);
          
        if (error && error.code !== '23505') { // Ignorer les erreurs de duplication
          console.error('Erreur lors de la migration du statut:', error);
        }
      }
    }
    
    // Migrer les employés et leurs plannings
    if (data.employees && data.employees.length > 0) {
      for (const employee of data.employees) {
        // Insérer l'employé
        const supabaseEmployee = mapEmployeeToSupabaseEmployee(employee);
        
        const { data: insertedEmployee, error: employeeError } = await supabase
          .from('employes')
          .insert(supabaseEmployee as any)
          .select()
          .single();
          
        if (employeeError) {
          console.error('Erreur lors de la migration de l\'employé:', employeeError);
          continue;
        }
        
        // Insérer le planning de l'employé
        if (employee.schedule && employee.schedule.length > 0) {
          for (const dayStatus of employee.schedule) {
            if (dayStatus.status) {
              const supabaseSchedule = mapDayStatusToSupabaseSchedule(
                (insertedEmployee as any).id, 
                dayStatus
              );
              
              const { error: scheduleError } = await supabase
                .from('employe_schedule')
                .insert(supabaseSchedule as any);
                
              if (scheduleError) {
                console.error('Erreur lors de la migration du planning:', scheduleError);
              }
            }
          }
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la migration des données:', error);
    return false;
  }
};
