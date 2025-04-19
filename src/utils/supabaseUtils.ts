import { supabase } from "@/integrations/supabase/client";
import { Employee, DayStatus, Project, MonthData } from '@/types';
import { toast } from 'sonner';

/**
 * Flag to track if we're in offline mode
 */
let isOfflineMode = false;

/**
 * Check Supabase connection status and set offline mode if needed
 */
export const checkSupabaseConnection = async () => {
  try {
    // Simple query to check if we can connect to Supabase
    const { data, error } = await supabase
      .from('employes')
      .select('count()', { count: 'exact' });
      
    if (error) throw error;
    
    // If we successfully connected, turn off offline mode
    if (isOfflineMode) {
      isOfflineMode = false;
      toast.success('Connexion à la base de données rétablie');
    }
    
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    
    // If we weren't already in offline mode, show a notification
    if (!isOfflineMode) {
      isOfflineMode = true;
      toast.warning('Mode hors-ligne activé - les données sont enregistrées localement');
    }
    
    return false;
  }
};

/**
 * Get all employees from Supabase or localStorage in offline mode
 */
export const fetchEmployees = async () => {
  // First check connection
  await checkSupabaseConnection();
  
  if (isOfflineMode) {
    // In offline mode, use local storage
    const savedData = localStorage.getItem('planningData');
    if (savedData) {
      const data = JSON.parse(savedData);
      return data.employees || [];
    }
    return [];
  }
  
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
    
    // Fall back to local storage
    isOfflineMode = true;
    toast.warning('Mode hors-ligne activé - utilisation des données locales');
    
    const savedData = localStorage.getItem('planningData');
    if (savedData) {
      const data = JSON.parse(savedData);
      return data.employees || [];
    }
    return [];
  }
};

/**
 * Save an employee to Supabase or localStorage in offline mode
 */
export const saveEmployee = async (employee: Employee) => {
  // Update local storage first for immediate feedback
  const savedData = localStorage.getItem('planningData');
  if (savedData) {
    const data = JSON.parse(savedData);
    
    if (!employee.id) {
      // This is where we'd normally get an ID from the database
      // but since we might be offline, we'll use a local ID format
      employee.id = `local-${Date.now()}`;
    }
    
    // Update or add the employee in the local data
    const employeeIndex = data.employees.findIndex((emp: Employee) => emp.id === employee.id);
    if (employeeIndex >= 0) {
      data.employees[employeeIndex] = employee;
    } else {
      data.employees.push(employee);
    }
    
    localStorage.setItem('planningData', JSON.stringify(data));
  }
  
  // If we're in offline mode, don't try to save to Supabase
  if (isOfflineMode) {
    toast.success('Employé sauvegardé localement (mode hors-ligne)');
    return true;
  }
  
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
    
    // Switch to offline mode
    isOfflineMode = true;
    toast.warning('Mode hors-ligne activé - les données sont enregistrées localement');
    
    return true; // We still return true because we saved to localStorage
  }
};

/**
 * Delete an employee from Supabase or localStorage in offline mode
 */
export const deleteEmployee = async (employeeId: string) => {
  // Update local storage first for immediate feedback
  const savedData = localStorage.getItem('planningData');
  if (savedData) {
    const data = JSON.parse(savedData);
    data.employees = data.employees.filter((emp: Employee) => emp.id !== employeeId);
    localStorage.setItem('planningData', JSON.stringify(data));
  }
  
  // If we're in offline mode, don't try to delete from Supabase
  if (isOfflineMode) {
    toast.success('Employé supprimé localement (mode hors-ligne)');
    return true;
  }
  
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
    
    // Switch to offline mode
    isOfflineMode = true;
    toast.warning('Mode hors-ligne activé - les données sont enregistrées localement');
    
    return true; // We still return true because we deleted from localStorage
  }
};

/**
 * Fetch schedule for an employee
 */
export const fetchSchedule = async (employeeId: string) => {
  // If we're in offline mode, get from localStorage
  if (isOfflineMode) {
    const savedData = localStorage.getItem('planningData');
    if (savedData) {
      const data = JSON.parse(savedData);
      const employee = data.employees.find((emp: Employee) => emp.id === employeeId);
      return employee?.schedule || [];
    }
    return [];
  }
  
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
    
    // Switch to offline mode and get data from localStorage
    isOfflineMode = true;
    
    const savedData = localStorage.getItem('planningData');
    if (savedData) {
      const data = JSON.parse(savedData);
      const employee = data.employees.find((emp: Employee) => emp.id === employeeId);
      return employee?.schedule || [];
    }
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
