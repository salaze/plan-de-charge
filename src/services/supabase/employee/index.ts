
import { employeeQueries } from "./employeeQueries";
import { employeeCommands } from "./employeeCommands";
import { employeeRoleService } from "./employeeRoleService";
import { employeeScheduleService } from "../employeeScheduleService";
import { Employee, DayStatus } from "@/types";

/**
 * Unified employee service that combines all employee-related operations
 */
export const employeeService = {
  /**
   * Get all employees
   */
  getAll: employeeQueries.getAll,
  
  /**
   * Create a new employee
   */
  create: employeeCommands.create,
  
  /**
   * Update an existing employee
   */
  update: employeeCommands.update,
  
  /**
   * Delete an employee
   */
  delete: employeeCommands.delete,
  
  /**
   * Update an employee's role
   */
  updateRole: employeeRoleService.updateRole,
  
  /**
   * Update an employee's password
   */
  updatePassword: employeeRoleService.updatePassword,
  
  /**
   * Update an employee's status for a specific date
   * This is a compatibility method to ensure existing code continues to work
   */
  updateStatus: (
    employeeId: string, 
    dayStatus: { 
      date: string; 
      status: string; 
      period: 'AM' | 'PM' | 'FULL'; 
      isHighlighted?: boolean;
      projectCode?: string;
      note?: string;
    }
  ): Promise<boolean> => {
    return employeeScheduleService.updateStatus(employeeId, dayStatus);
  }
};

// Re-export types from the employee mappers for backwards compatibility
export { 
  SupabaseEmployee, 
  SupabaseSchedule,
  mapSupabaseEmployeeToEmployee, 
  mapEmployeeToSupabaseEmployee 
} from "../mappers/employeeMappers";
