
import { supabase } from "@/integrations/supabase/client";
import { Employee, DayStatus, Project, MonthData } from '@/types';
import { toast } from 'sonner';

/**
 * Get all employees from Supabase
 */
export const fetchEmployees = async () => {
  try {
    const { data: employees, error } = await supabase
      .from('employes')
      .select('*');
      
    if (error) throw error;
    
    // Transform the data to match our application's Employee type
    return employees.map(emp => ({
      id: emp.id,
      name: emp.nom,
      email: emp.identifiant,
      position: emp.fonction,
      department: emp.departement,
      role: emp.role || 'employee',
      uid: emp.uid,
      schedule: []
    })) as Employee[];
  } catch (error) {
    console.error('Error fetching employees:', error);
    toast.error('Erreur lors de la récupération des employés');
    return [];
  }
};

/**
 * Save an employee to Supabase
 */
export const saveEmployee = async (employee: Employee) => {
  try {
    const { error } = await supabase
      .from('employes')
      .upsert({
        id: employee.id,
        nom: employee.name,
        prenom: '',
        identifiant: employee.email,
        fonction: employee.position,
        departement: employee.department,
        role: employee.role,
        uid: employee.uid
      });
      
    if (error) throw error;
    
    toast.success('Employé sauvegardé avec succès');
    return true;
  } catch (error) {
    console.error('Error saving employee:', error);
    toast.error('Erreur lors de la sauvegarde de l\'employé');
    return false;
  }
};

/**
 * Delete an employee from Supabase
 */
export const deleteEmployee = async (employeeId: string) => {
  try {
    const { error } = await supabase
      .from('employes')
      .delete()
      .eq('id', employeeId);
      
    if (error) throw error;
    
    toast.success('Employé supprimé avec succès');
    return true;
  } catch (error) {
    console.error('Error deleting employee:', error);
    toast.error('Erreur lors de la suppression de l\'employé');
    return false;
  }
};

/**
 * Fetch schedule for an employee
 */
export const fetchSchedule = async (employeeId: string) => {
  try {
    const { data, error } = await supabase
      .from('employe_schedule')
      .select('*')
      .eq('employe_id', employeeId);
      
    if (error) throw error;
    
    // Transform to our application's DayStatus type
    return data.map(item => ({
      date: item.date,
      status: item.statut_code,
      period: item.period,
      note: item.note,
      projectCode: item.project_code,
      isHighlighted: item.is_highlighted
    })) as DayStatus[];
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return [];
  }
};

/**
 * Save a schedule entry to Supabase
 */
export const saveScheduleEntry = async (
  employeeId: string, 
  entry: DayStatus
) => {
  try {
    const { error } = await supabase
      .from('employe_schedule')
      .upsert({
        employe_id: employeeId,
        date: entry.date,
        statut_code: entry.status,
        period: entry.period,
        note: entry.note || null,
        project_code: entry.projectCode || null,
        is_highlighted: entry.isHighlighted || false
      });
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error saving schedule entry:', error);
    return false;
  }
};

/**
 * Delete a schedule entry from Supabase
 */
export const deleteScheduleEntry = async (
  employeeId: string, 
  date: string, 
  period: string
) => {
  try {
    const { error } = await supabase
      .from('employe_schedule')
      .delete()
      .match({
        employe_id: employeeId,
        date,
        period
      });
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting schedule entry:', error);
    return false;
  }
};

/**
 * Synchronize local data with Supabase
 */
export const syncWithSupabase = async (data: MonthData) => {
  try {
    // First, synchronize employees
    for (const employee of data.employees) {
      await saveEmployee(employee);
      
      // Then sync their schedule
      for (const scheduleItem of employee.schedule) {
        if (scheduleItem.status === '') {
          await deleteScheduleEntry(employee.id, scheduleItem.date, scheduleItem.period);
        } else {
          await saveScheduleEntry(employee.id, scheduleItem);
        }
      }
    }
    
    toast.success('Données synchronisées avec Supabase');
    return true;
  } catch (error) {
    console.error('Error synchronizing with Supabase:', error);
    toast.error('Erreur lors de la synchronisation avec Supabase');
    return false;
  }
};

/**
 * Check Supabase connection status
 */
export const checkSupabaseConnection = async () => {
  try {
    // Simple query to check if we can connect to Supabase
    const { data, error } = await supabase
      .from('employes')
      .select('count()', { count: 'exact' });
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
};
