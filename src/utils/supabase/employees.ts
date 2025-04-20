
import { supabase } from "@/integrations/supabase/client";
import { Employee } from '@/types';
import { toast } from 'sonner';
import { createEmptyEmployee } from '@/utils/employeeUtils';

export const fetchEmployees = async () => {
  try {
    console.log("Tentative de récupération des employés depuis Supabase...");
    
    // Ajouter un timeout pour éviter d'attendre indéfiniment
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes de timeout
    
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
      console.log("Problème de connexion réseau détecté");
    } else {
      toast.error('Erreur lors de la récupération des employés');
    }
    
    // En cas d'erreur, essayer de charger depuis le stockage local
    try {
      const savedData = localStorage.getItem('planningData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (parsedData.employees && parsedData.employees.length > 0) {
          console.log(`Fallback: ${parsedData.employees.length} employés chargés depuis le cache local`);
          return parsedData.employees as Employee[];
        }
      }
    } catch (localError) {
      console.error('Erreur lors du chargement du cache local:', localError);
    }
    
    // Si tout échoue, retourner un tableau vide
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
    
    // Message d'erreur spécifique pour les problèmes de réseau
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
    
    // Message d'erreur spécifique pour les problèmes de réseau
    if (error.message?.includes('NetworkError')) {
      toast.error('Problème de connexion au serveur. Vérifiez votre réseau.');
    } else {
      toast.error('Erreur lors de la suppression de l\'employé');
    }
    
    throw error;
  }
};
