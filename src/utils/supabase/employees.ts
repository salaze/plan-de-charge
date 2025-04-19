
import { supabase } from "@/integrations/supabase/client";
import { Employee } from '@/types';
import { toast } from 'sonner';
import { getOfflineMode, setOfflineMode } from './connection';

export const fetchEmployees = async () => {
  if (getOfflineMode()) {
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
    
    setOfflineMode(true);
    toast.warning('Mode hors-ligne activé - utilisation des données locales');
    
    const savedData = localStorage.getItem('planningData');
    if (savedData) {
      const data = JSON.parse(savedData);
      return data.employees || [];
    }
    return [];
  }
};

export const saveEmployee = async (employee: Employee) => {
  const savedData = localStorage.getItem('planningData');
  if (savedData) {
    const data = JSON.parse(savedData);
    
    if (!employee.id) {
      employee.id = `local-${Date.now()}`;
    }
    
    const employeeIndex = data.employees.findIndex((emp: Employee) => emp.id === employee.id);
    if (employeeIndex >= 0) {
      data.employees[employeeIndex] = employee;
    } else {
      data.employees.push(employee);
    }
    
    localStorage.setItem('planningData', JSON.stringify(data));
  }
  
  if (getOfflineMode()) {
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
    
    setOfflineMode(true);
    toast.warning('Mode hors-ligne activé - les données sont enregistrées localement');
    
    return true;
  }
};

export const deleteEmployee = async (employeeId: string) => {
  const savedData = localStorage.getItem('planningData');
  if (savedData) {
    const data = JSON.parse(savedData);
    data.employees = data.employees.filter((emp: Employee) => emp.id !== employeeId);
    localStorage.setItem('planningData', JSON.stringify(data));
  }
  
  if (getOfflineMode()) {
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
    
    setOfflineMode(true);
    toast.warning('Mode hors-ligne activé - les données sont enregistrées localement');
    
    return true;
  }
};
