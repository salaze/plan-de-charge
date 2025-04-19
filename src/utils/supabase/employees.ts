
import { supabase } from "@/integrations/supabase/client";
import { Employee } from '@/types';
import { toast } from 'sonner';

export const fetchEmployees = async () => {
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
    throw error;
  }
};

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
    throw error;
  }
};

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
    throw error;
  }
};
