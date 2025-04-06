
import { Employee, Project, Status, MonthData } from '@/types';
import { 
  saveData,
  employeeService,
  projectService,
  statusService
} from '@/services/jsonStorage';

/**
 * Migre les données du localStorage vers le format JSON structuré
 */
export const migrateFromLocalStorage = (): boolean => {
  try {
    const savedData = localStorage.getItem('planningData');
    if (!savedData) {
      console.log('Aucune donnée trouvée dans localStorage, migration non nécessaire');
      return false;
    }
    
    const parsedData = JSON.parse(savedData);
    
    // Préparer les structures de données
    const employees = parsedData.employees || [];
    const projects = parsedData.projects || [];
    const statuses = parsedData.statuses || [];
    
    // Créer un objet MonthData
    const planningData: MonthData = {
      year: parsedData.year || new Date().getFullYear(),
      month: parsedData.month !== undefined ? parsedData.month : new Date().getMonth(),
      employees,
      projects
    };
    
    // Sauvegarder via le service de stockage JSON
    saveData({
      employees,
      projects,
      statuses,
      planningData
    });
    
    console.log('Migration depuis localStorage réussie:', {
      employees: employees.length,
      projects: projects.length,
      statuses: statuses.length
    });
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la migration depuis localStorage:', error);
    return false;
  }
};

/**
 * Migre les données depuis un fichier JSON
 */
export const migrateFromJsonFile = async (file: File): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result !== 'string') {
          reject(new Error('Format de fichier non valide'));
          return;
        }
        
        const parsedData = JSON.parse(result);
        
        // Sauvegarder via le service de stockage JSON
        saveData(parsedData);
        
        resolve(true);
      } catch (error) {
        console.error('Erreur lors de la migration depuis le fichier JSON:', error);
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsText(file);
  });
};

/**
 * Migre les données vers JSON pour préparation à l'export
 */
export const prepareJsonExport = (): string => {
  // Récupérer toutes les données
  const employees = employeeService.getAll();
  const projects = projectService.getAll();
  const statuses = statusService.getAll();
  
  // Créer l'objet de données complet
  const exportData = {
    employees,
    projects,
    statuses,
    planningData: {
      year: new Date().getFullYear(),
      month: new Date().getMonth(),
      employees,
      projects
    }
  };
  
  // Convertir en JSON avec indentation pour lisibilité
  return JSON.stringify(exportData, null, 2);
};
