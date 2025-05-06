import { supabase } from "@/integrations/supabase/client";
import { Employee } from '@/types';
import { toast } from 'sonner';

export const fetchEmployees = async (departmentFilter?: string) => {
  try {
    console.log(`Récupération des employés${departmentFilter ? ` du département: ${departmentFilter}` : ''}`);
    
    let query = supabase
      .from('employes')
      .select('*')
      .order('nom');
    
    // Filtrer par département si spécifié
    if (departmentFilter) {
      query = query.eq('departement', departmentFilter);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Erreur lors de la récupération des employés:', error);
      throw error;
    }
    
    // Transformer les données pour l'application
    const employees = data.map(emp => ({
      id: emp.id,
      name: `${emp.nom} ${emp.prenom || ''}`.trim(),
      firstName: emp.prenom || '',
      lastName: emp.nom,
      jobTitle: emp.fonction || '',
      department: emp.departement || '',
      role: emp.role || '',
      uid: emp.uid || '',
      schedule: [] // Sera rempli séparément
    }));
    
    console.log(`${employees.length} employés récupérés`);
    return employees;
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
};

export const saveEmployee = async (employee: Employee) => {
  try {
    console.log("Sauvegarde de l'employé dans Supabase:", employee);
    
    // Vérifions que l'ID est valide pour Supabase (UUID)
    if (employee.id && !isValidUUID(employee.id)) {
      console.error("ID non valide pour Supabase:", employee.id);
      throw new Error("Format d'ID invalide");
    }
    
    // Structure de données adaptée au schéma de la table employes de Supabase
    const employeeData: any = {
      id: employee.id,
      nom: employee.name,
      prenom: '', // Champ requis dans Supabase, mais pas utilisé dans notre application
      identifiant: employee.email || '',
      fonction: employee.position || '',
      departement: employee.department || '',
      role: employee.role || 'employee',
      uid: employee.uid || '',
      password: employee.password || '' // Make sure to save password
    };
    
    console.log("Données envoyées à Supabase:", employeeData);
    
    const { data, error } = await supabase
      .from('employes')
      .upsert(employeeData)
      .select();
      
    if (error) {
      console.error('Erreur Supabase lors de la sauvegarde:', error);
      throw error;
    }
    
    console.log("Résultat de la sauvegarde:", data);
    toast.success('Employé sauvegardé avec succès');
    return true;
  } catch (error: any) {
    console.error('Erreur détaillée lors de la sauvegarde de l\'employé:', error);
    
    if (error.message?.includes('NetworkError')) {
      toast.error('Problème de connexion au serveur. Vérifiez votre réseau.');
    } else if (error.code === '23505') {
      toast.error('Un employé avec cet identifiant existe déjà.');
    } else if (error.code === '23502') {
      toast.error('Données incomplètes: certains champs obligatoires sont manquants.');
    } else if (error.message?.includes('invalid input syntax') || error.message?.includes("Format d'ID invalide")) {
      toast.error('Format de données invalide. L\'ID doit être au format UUID valide.');
    } else {
      toast.error(`Erreur lors de la sauvegarde de l'employé: ${error.message || 'erreur inconnue'}`);
    }
    
    return false;
  }
};

// Fonction pour vérifier si une chaîne est un UUID valide
function isValidUUID(id: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export const deleteEmployee = async (employeeId: string) => {
  try {
    // Vérifions que l'ID est valide pour Supabase (UUID)
    if (!isValidUUID(employeeId)) {
      console.error("ID non valide pour Supabase:", employeeId);
      throw new Error("Format d'ID invalide");
    }
    
    const { error } = await supabase
      .from('employes')
      .delete()
      .eq('id', employeeId);
      
    if (error) {
      console.error('Erreur lors de la suppression:', error);
      throw error;
    }
    
    toast.success('Employé supprimé avec succès');
    return true;
  } catch (error: any) {
    console.error('Erreur détaillée lors de la suppression de l\'employé:', error);
    
    if (error.message?.includes('NetworkError')) {
      toast.error('Problème de connexion au serveur. Vérifiez votre réseau.');
    } else {
      toast.error('Erreur lors de la suppression de l\'employé');
    }
    
    return false;
  }
};
