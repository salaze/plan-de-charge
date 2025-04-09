
import { supabase } from "@/integrations/supabase/client";
import { Employee } from "@/types";
import { generateId } from "@/utils";
import { 
  mapSupabaseEmployeeToEmployee, 
  mapEmployeeToSupabaseEmployee, 
  SupabaseEmployee, 
  SupabaseSchedule 
} from "./mappers/employeeMappers";
import { employeeScheduleService } from "./employeeScheduleService";

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

  // Méthode de compatibilité pour ne pas casser les fonctionnalités existantes
  // Elle délègue simplement au nouveau service employeeScheduleService
  async updateStatus(
    employeeId: string, 
    dayStatus: { 
      date: string; 
      status: string; 
      period: 'AM' | 'PM' | 'FULL'; 
      isHighlighted?: boolean;
      projectCode?: string;
      note?: string;
    }
  ): Promise<boolean> {
    return employeeScheduleService.updateStatus(employeeId, dayStatus);
  }
};

// Ré-exporter les types et fonctions de mappers pour assurer la compatibilité
export type { SupabaseEmployee, SupabaseSchedule };
export { mapSupabaseEmployeeToEmployee, mapEmployeeToSupabaseEmployee };
