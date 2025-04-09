
import { supabase } from "@/integrations/supabase/client";
import { Employee } from "@/types";
import { 
  mapSupabaseEmployeeToEmployee, 
  SupabaseEmployee, 
  SupabaseSchedule 
} from "../mappers/employeeMappers";

/**
 * Service for fetching employee data from Supabase
 */
export const employeeQueries = {
  /**
   * Get all employees with their schedules
   */
  async getAll(): Promise<Employee[]> {
    try {
      console.log('Attempting to fetch all employees');
      
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
      console.error('Erreur non gérée dans employeeQueries.getAll():', error);
      return [];
    }
  }
};
