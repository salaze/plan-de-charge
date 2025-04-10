
// Ce fichier réexporte les services locaux pour remplacer les services Supabase
// Cela permet de conserver la compatibilité avec le code existant sans avoir à tout modifier

import { 
  employeeService as localEmployeeService,
  statusService as localStatusService,
  projectService,
  planningService
} from './jsonStorage';

// Réexporter les services du localStorage pour remplacer les services Supabase
export const employeeService = localEmployeeService;
export const statusService = localStatusService;

// Réexporter les autres services
export { projectService, planningService };

// Fonction vide pour maintenir la compatibilité avec le code qui utilise migrateLocalDataToSupabase
export const migrateLocalDataToSupabase = async (): Promise<boolean> => {
  console.log('Migration vers Supabase désactivée - Utilisation du localStorage uniquement');
  return true;
};

// Fonction vide pour maintenir la compatibilité
export const clearSupabaseTables = async (): Promise<boolean> => {
  console.log('Suppression des tables Supabase désactivée - Utilisation du localStorage uniquement');
  return true;
};

// Fonction vide pour maintenir la compatibilité
export const resetSupabaseData = async (): Promise<boolean> => {
  console.log('Réinitialisation des données Supabase désactivée - Utilisation du localStorage uniquement');
  return true;
};

// Service de planning factice qui utilise le localStorage
export const employeeScheduleService = {
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
    try {
      const result = localEmployeeService.updateStatus(employeeId, dayStatus);
      return Promise.resolve(result);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      return Promise.resolve(false);
    }
  },
  
  getEmployeeSchedule: (employeeId: string): Promise<any[]> => {
    const employee = localEmployeeService.getById(employeeId);
    return Promise.resolve(employee?.schedule || []);
  }
};
