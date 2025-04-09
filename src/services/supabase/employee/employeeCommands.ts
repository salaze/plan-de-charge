
import { supabase } from "@/integrations/supabase/client";
import { Employee } from "@/types";
import { generateId } from "@/utils";
import { 
  mapEmployeeToSupabaseEmployee, 
  mapSupabaseEmployeeToEmployee, 
  SupabaseEmployee 
} from "../mappers/employeeMappers";

/**
 * Service for creating, updating and deleting employees in Supabase
 */
export const employeeCommands = {
  /**
   * Create a new employee
   */
  async create(employee: Omit<Employee, 'id' | 'schedule'>): Promise<Employee | null> {
    try {
      console.log('Creating employee with data:', employee);
      
      const supabaseEmployee = mapEmployeeToSupabaseEmployee({
        ...employee, 
        id: generateId(), 
        schedule: []
      });

      console.log('Mapped to Supabase employee format:', supabaseEmployee);

      // Insérer dans la table employes
      const { data, error } = await supabase
        .from('employes')
        .insert({
          nom: employee.name,
          uid: employee.uid,
          fonction: employee.position,
          departement: employee.department,
          password: employee.password || 'employee123'
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création de l\'employé:', error);
        return null;
      }

      console.log('Employee created successfully, response:', data);
      
      return mapSupabaseEmployeeToEmployee(data as unknown as SupabaseEmployee);
    } catch (error) {
      console.error('Erreur non gérée lors de la création:', error);
      return null;
    }
  },

  /**
   * Update an existing employee
   */
  async update(employee: Employee): Promise<Employee | null> {
    try {
      const supabaseEmployee = mapEmployeeToSupabaseEmployee(employee);
      
      console.log('Updating employee:', employee.id, supabaseEmployee);

      const { data, error } = await supabase
        .from('employes')
        .update({
          nom: employee.name,
          uid: employee.uid,
          fonction: employee.position,
          departement: employee.department,
          password: employee.password
        })
        .eq('id', employee.id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour de l\'employé:', error);
        return null;
      }

      console.log('Employee updated successfully, response:', data);
      
      return mapSupabaseEmployeeToEmployee(data as unknown as SupabaseEmployee);
    } catch (error) {
      console.error('Erreur non gérée lors de la mise à jour:', error);
      return null;
    }
  },

  /**
   * Delete an employee by ID
   */
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
  }
};
