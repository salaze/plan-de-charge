
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types";

/**
 * Service for managing employee roles
 */
export const employeeRoleService = {
  /**
   * Update the role of an employee
   */
  async updateRole(employeeId: string, role: UserRole): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('employes')
        .update({ role })
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

  /**
   * Update an employee's password
   */
  async updatePassword(employeeId: string, password: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('employes')
        .update({ password })
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
  }
};
