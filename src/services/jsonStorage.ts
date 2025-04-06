
import { MonthData, Employee, Project, Status, DayStatus } from '@/types';
import { supabase } from '@/integrations/supabase/client';

// Interface de base pour tous les types de données stockées
interface JsonData {
  employees: Employee[];
  projects: Project[];
  statuses: Status[];
  planningData: MonthData;
}

// Initialisation des données par défaut
const defaultData: JsonData = {
  employees: [],
  projects: [],
  statuses: [],
  planningData: {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    employees: [],
    projects: []
  }
};

// Cache mémoire des données
let dataCache: JsonData | null = null;

/**
 * Charge les données depuis le stockage local ou initialise avec les valeurs par défaut
 */
export const loadData = (): JsonData => {
  if (dataCache) return dataCache;
  
  try {
    const savedData = localStorage.getItem('planningData');
    if (!savedData) {
      return defaultData;
    }
    
    const parsedData = JSON.parse(savedData);
    
    // Structurer les données selon notre modèle
    const jsonData: JsonData = {
      employees: parsedData.employees || [],
      projects: parsedData.projects || [],
      statuses: parsedData.statuses || [],
      planningData: {
        year: parsedData.year || new Date().getFullYear(),
        month: parsedData.month !== undefined ? parsedData.month : new Date().getMonth(),
        employees: parsedData.employees || [],
        projects: parsedData.projects || []
      }
    };
    
    dataCache = jsonData;
    return jsonData;
  } catch (error) {
    console.error("Erreur lors du chargement des données:", error);
    return defaultData;
  }
};

/**
 * Sauvegarde les données dans le stockage local
 */
export const saveData = (data: Partial<JsonData>): void => {
  try {
    // Charger les données existantes
    const currentData = loadData();
    
    // Mettre à jour avec les nouvelles données
    const updatedData: JsonData = {
      ...currentData,
      ...data,
      // Mise à jour spécifique pour planningData qui contient des sous-propriétés
      planningData: {
        ...currentData.planningData,
        ...(data.planningData || {}),
        // Si employees ou projects sont fournis directement, les mettre à jour dans planningData aussi
        employees: data.employees || currentData.planningData.employees,
        projects: data.projects || currentData.planningData.projects
      }
    };
    
    // Mettre à jour le cache
    dataCache = updatedData;
    
    // Sauvegarder dans localStorage
    localStorage.setItem('planningData', JSON.stringify(updatedData));
    
    // Option: synchroniser avec Supabase si configuré
    syncWithSupabase(updatedData);
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des données:", error);
  }
};

/**
 * Fonctions CRUD pour les employés
 */
export const employeeService = {
  getAll: (): Employee[] => {
    return loadData().employees;
  },
  
  getById: (id: string): Employee | undefined => {
    return loadData().employees.find(emp => emp.id === id);
  },
  
  create: (employee: Omit<Employee, 'id'>): Employee => {
    const data = loadData();
    const newEmployee: Employee = {
      ...employee,
      id: crypto.randomUUID(),
      schedule: employee.schedule || []
    };
    
    const updatedEmployees = [...data.employees, newEmployee];
    saveData({ employees: updatedEmployees });
    
    return newEmployee;
  },
  
  update: (employee: Employee): Employee => {
    const data = loadData();
    const updatedEmployees = data.employees.map(emp => 
      emp.id === employee.id ? employee : emp
    );
    
    saveData({ employees: updatedEmployees });
    return employee;
  },
  
  delete: (id: string): boolean => {
    const data = loadData();
    const updatedEmployees = data.employees.filter(emp => emp.id !== id);
    
    if (updatedEmployees.length !== data.employees.length) {
      saveData({ employees: updatedEmployees });
      return true;
    }
    return false;
  },
  
  updateStatus: (employeeId: string, dayStatus: DayStatus): boolean => {
    const data = loadData();
    const employee = data.employees.find(emp => emp.id === employeeId);
    
    if (!employee) return false;
    
    // Trouver si un statut existe déjà pour cette date et période
    const existingStatusIndex = employee.schedule.findIndex(
      (day) => day.date === dayStatus.date && day.period === dayStatus.period
    );
    
    let updatedSchedule = [...employee.schedule];
    
    if (existingStatusIndex >= 0) {
      // Mettre à jour le statut existant ou le supprimer si le statut est vide
      if (dayStatus.status === '') {
        updatedSchedule.splice(existingStatusIndex, 1);
      } else {
        updatedSchedule[existingStatusIndex] = dayStatus;
      }
    } else if (dayStatus.status !== '') {
      // Ajouter un nouveau statut
      updatedSchedule.push(dayStatus);
    }
    
    const updatedEmployee = {
      ...employee,
      schedule: updatedSchedule
    };
    
    return Boolean(this.update(updatedEmployee));
  },
  
  updateRole: (employeeId: string, role: string): boolean => {
    const data = loadData();
    const employeeIndex = data.employees.findIndex(emp => emp.id === employeeId);
    
    if (employeeIndex === -1) return false;
    
    const updatedEmployees = [...data.employees];
    updatedEmployees[employeeIndex] = {
      ...updatedEmployees[employeeIndex],
      role: role as any
    };
    
    saveData({ employees: updatedEmployees });
    return true;
  }
};

/**
 * Fonctions CRUD pour les projets
 */
export const projectService = {
  getAll: (): Project[] => {
    return loadData().projects;
  },
  
  getById: (id: string): Project | undefined => {
    return loadData().projects.find(project => project.id === id);
  },
  
  create: (project: Omit<Project, 'id'>): Project => {
    const data = loadData();
    const newProject: Project = {
      ...project,
      id: crypto.randomUUID()
    };
    
    const updatedProjects = [...data.projects, newProject];
    saveData({ projects: updatedProjects });
    
    return newProject;
  },
  
  update: (project: Project): Project => {
    const data = loadData();
    const updatedProjects = data.projects.map(p => 
      p.id === project.id ? project : p
    );
    
    saveData({ projects: updatedProjects });
    return project;
  },
  
  delete: (id: string): boolean => {
    const data = loadData();
    const updatedProjects = data.projects.filter(p => p.id !== id);
    
    if (updatedProjects.length !== data.projects.length) {
      saveData({ projects: updatedProjects });
      return true;
    }
    return false;
  }
};

/**
 * Fonctions CRUD pour les statuts
 */
export const statusService = {
  getAll: (): Status[] => {
    return loadData().statuses;
  },
  
  getSorted: (): Status[] => {
    return [...loadData().statuses].sort((a, b) => {
      const orderA = a.displayOrder || 999;
      const orderB = b.displayOrder || 999;
      return orderA - orderB;
    });
  },
  
  getById: (id: string): Status | undefined => {
    return loadData().statuses.find(status => status.id === id);
  },
  
  create: (status: Omit<Status, 'id'>): Status => {
    const data = loadData();
    const newStatus: Status = {
      ...status,
      id: crypto.randomUUID()
    };
    
    const updatedStatuses = [...data.statuses, newStatus];
    saveData({ statuses: updatedStatuses });
    
    return newStatus;
  },
  
  update: (status: Status): Status => {
    const data = loadData();
    const updatedStatuses = data.statuses.map(s => 
      s.id === status.id ? status : s
    );
    
    saveData({ statuses: updatedStatuses });
    return status;
  },
  
  delete: (id: string): boolean => {
    const data = loadData();
    const updatedStatuses = data.statuses.filter(s => s.id !== id);
    
    if (updatedStatuses.length !== data.statuses.length) {
      saveData({ statuses: updatedStatuses });
      return true;
    }
    return false;
  }
};

/**
 * Fonctions pour gérer le planning et les données temporelles
 */
export const planningService = {
  getData: (): MonthData => {
    return loadData().planningData;
  },
  
  updateMonth: (year: number, month: number): void => {
    const data = loadData();
    saveData({
      planningData: {
        ...data.planningData,
        year,
        month
      }
    });
  },
  
  exportData: (): MonthData => {
    const data = loadData();
    return data.planningData;
  }
};

/**
 * Synchronisation facultative avec Supabase
 */
const syncWithSupabase = async (data: JsonData): Promise<void> => {
  try {
    // Vérifier si Supabase est configuré
    if (supabase) {
      // Cette fonction pourrait être développée pour synchroniser les données avec Supabase
      // Par exemple, sauvegarder les données JSON dans une table spécifique
      
      // Exemple: 
      // await supabase.from('app_data').upsert({
      //   id: 'main_data',
      //   data: JSON.stringify(data),
      //   updated_at: new Date().toISOString()
      // });
    }
  } catch (error) {
    console.error("Erreur lors de la synchronisation avec Supabase:", error);
  }
};

/**
 * Fonction d'exportation des données pour sauvegarde externe
 */
export const exportAllData = (): string => {
  return JSON.stringify(loadData(), null, 2);
};

/**
 * Fonction d'importation des données depuis une sauvegarde
 */
export const importAllData = (jsonData: string): boolean => {
  try {
    const parsedData = JSON.parse(jsonData);
    saveData(parsedData);
    return true;
  } catch (error) {
    console.error("Erreur lors de l'importation des données:", error);
    return false;
  }
};
