
import { supabase } from "@/integrations/supabase/client";
import { Employee } from '@/types';
import { toast } from 'sonner';

export const fetchEmployees = async () => {
  try {
    console.log("Récupération des employés depuis Supabase...");
    
    // Add a timeout to avoid waiting indefinitely
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout
    
    const { data: employees, error } = await supabase
      .from('employes')
      .select('*')
      .abortSignal(controller.signal);
    
    clearTimeout(timeoutId);
      
    if (error) {
      console.error("Erreur Supabase:", error);
      throw error;
    }
    
    console.log(`${employees ? employees.length : 0} employés récupérés avec succès`);
    
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
  } catch (error: any) {
    console.error('Erreur lors de la récupération des employés:', error);
    
    // Message d'erreur spécifique pour les problèmes de réseau
    if (error.message?.includes('NetworkError') || error.name === 'AbortError') {
      toast.error('Problème de connexion au serveur. Vérifiez votre réseau.');
    } else {
      toast.error('Erreur lors de la récupération des employés');
    }
    
    // No fallback to localStorage, return empty array instead
    return [];
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
  } catch (error: any) {
    console.error('Erreur lors de la sauvegarde de l\'employé:', error);
    
    if (error.message?.includes('NetworkError')) {
      toast.error('Problème de connexion au serveur. Vérifiez votre réseau.');
    } else {
      toast.error('Erreur lors de la sauvegarde de l\'employé');
    }
    
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
  } catch (error: any) {
    console.error('Erreur lors de la suppression de l\'employé:', error);
    
    if (error.message?.includes('NetworkError')) {
      toast.error('Problème de connexion au serveur. Vérifiez votre réseau.');
    } else {
      toast.error('Erreur lors de la suppression de l\'employé');
    }
    
    throw error;
  }
};
