
// Service pour gérer le stockage localStorage
import { Employee, Project, Status, Department, Client } from '@/types';
import { generateId } from '@/lib/utils';

const STORAGE_KEYS = {
  EMPLOYEES: 'planning_employees',
  PROJECTS: 'planning_projects',
  STATUSES: 'planning_statuses',
  DEPARTMENTS: 'planning_departments',
  CLIENTS: 'planning_clients',
  SETTINGS: 'planning_settings',
  USER: 'user'
};

// Fonction utilitaire pour gérer le localStorage
const localStorageWrapper = {
  getItem: async (key: string): Promise<string | null> => {
    return localStorage.getItem(key);
  },
  
  setItem: async (key: string, value: string): Promise<void> => {
    localStorage.setItem(key, value);
  },
  
  removeItem: async (key: string): Promise<void> => {
    localStorage.removeItem(key);
  }
};

// Service principal
export const storageService = {
  // Méthodes génériques
  getItem: localStorageWrapper.getItem,
  setItem: localStorageWrapper.setItem,
  removeItem: localStorageWrapper.removeItem,

  // Employés
  getEmployees: async (): Promise<Employee[]> => {
    try {
      const data = await localStorageWrapper.getItem(STORAGE_KEYS.EMPLOYEES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting employees:', error);
      return [];
    }
  },
  
  saveEmployees: async (employees: Employee[]): Promise<void> => {
    try {
      await localStorageWrapper.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    } catch (error) {
      console.error('Error saving employees:', error);
    }
  },

  addEmployee: async (employee: Omit<Employee, 'id'>): Promise<Employee> => {
    const employees = await storageService.getEmployees();
    const newEmployee: Employee = {
      ...employee,
      id: generateId(),
      schedule: employee.schedule || [],
      createdAt: new Date().toISOString()
    };
    
    employees.push(newEmployee);
    await storageService.saveEmployees(employees);
    return newEmployee;
  },

  updateEmployee: async (employee: Employee): Promise<Employee> => {
    const employees = await storageService.getEmployees();
    const index = employees.findIndex(e => e.id === employee.id);
    
    if (index !== -1) {
      employees[index] = employee;
      await storageService.saveEmployees(employees);
    }
    
    return employee;
  },

  deleteEmployee: async (id: string): Promise<boolean> => {
    const employees = await storageService.getEmployees();
    const newEmployees = employees.filter(employee => employee.id !== id);
    
    if (newEmployees.length !== employees.length) {
      await storageService.saveEmployees(newEmployees);
      return true;
    }
    
    return false;
  },

  // Projets
  getProjects: async (): Promise<Project[]> => {
    try {
      const data = await localStorageWrapper.getItem(STORAGE_KEYS.PROJECTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting projects:', error);
      return [];
    }
  },
  
  saveProjects: async (projects: Project[]): Promise<void> => {
    try {
      await localStorageWrapper.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (error) {
      console.error('Error saving projects:', error);
    }
  },

  // Départements
  getDepartments: async (): Promise<Department[]> => {
    try {
      const data = await localStorageWrapper.getItem(STORAGE_KEYS.DEPARTMENTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting departments:', error);
      return [];
    }
  },
  
  saveDepartments: async (departments: Department[]): Promise<void> => {
    try {
      await localStorageWrapper.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(departments));
    } catch (error) {
      console.error('Error saving departments:', error);
    }
  },

  // Statuts
  getStatuses: async (): Promise<Status[]> => {
    try {
      const data = await localStorageWrapper.getItem(STORAGE_KEYS.STATUSES);
      return data ? JSON.parse(data) : getDefaultStatuses();
    } catch (error) {
      console.error('Error getting statuses:', error);
      return getDefaultStatuses();
    }
  },
  
  saveStatuses: async (statuses: Status[]): Promise<void> => {
    try {
      await localStorageWrapper.setItem(STORAGE_KEYS.STATUSES, JSON.stringify(statuses));
    } catch (error) {
      console.error('Error saving statuses:', error);
    }
  },

  // Clients
  getClients: async (): Promise<Client[]> => {
    try {
      const data = await localStorageWrapper.getItem(STORAGE_KEYS.CLIENTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting clients:', error);
      return [];
    }
  },
  
  saveClients: async (clients: Client[]): Promise<void> => {
    try {
      await localStorageWrapper.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    } catch (error) {
      console.error('Error saving clients:', error);
    }
  },

  // Initialisation des données
  initializeData: async (): Promise<void> => {
    // Check if data already exists
    const employees = await storageService.getEmployees();
    const statuses = await storageService.getStatuses();
    const departments = await storageService.getDepartments();
    const projects = await storageService.getProjects();
    
    // If no employees, initialize with some sample data
    if (employees.length === 0) {
      await storageService.saveEmployees(getSampleEmployees());
    }
    
    // Initialize statuses if empty
    if (statuses.length === 0) {
      await storageService.saveStatuses(getDefaultStatuses());
    }
    
    // Initialize departments if empty
    if (departments.length === 0) {
      await storageService.saveDepartments(getSampleDepartments());
    }
    
    // Initialize projects if empty
    if (projects.length === 0) {
      await storageService.saveProjects(getSampleProjects());
    }
  }
};

// Données par défaut
function getDefaultStatuses(): Status[] {
  return [
    { code: 'present', label: 'Présent', color: '#22c55e' },
    { code: 'absent', label: 'Absent', color: '#ef4444' },
    { code: 'vacation', label: 'Congés', color: '#f59e0b' },
    { code: 'sick', label: 'Maladie', color: '#ec4899' },
    { code: 'training', label: 'Formation', color: '#3b82f6' },
    { code: 'remote', label: 'Télétravail', color: '#6366f1' },
    { code: 'mission', label: 'Mission', color: '#8b5cf6' },
    { code: 'project', label: 'Projet', color: '#10b981' }
  ];
}

function getSampleDepartments(): Department[] {
  return [
    { id: 'dep_1', name: 'Technique', color: '#3b82f6' },
    { id: 'dep_2', name: 'Commercial', color: '#22c55e' },
    { id: 'dep_3', name: 'Administration', color: '#8b5cf6' },
    { id: 'dep_4', name: 'Ressources Humaines', color: '#f59e0b' }
  ];
}

function getSampleEmployees(): Employee[] {
  return [
    { 
      id: 'emp_1', 
      name: 'Jean Dupont', 
      email: 'jean.dupont@example.com', 
      position: 'Développeur', 
      departmentId: 'dep_1', 
      role: 'employee',
      schedule: [],
      createdAt: new Date().toISOString()
    },
    { 
      id: 'emp_2', 
      name: 'Marie Martin', 
      email: 'marie.martin@example.com', 
      position: 'Chef de projet', 
      departmentId: 'dep_1', 
      role: 'employee',
      schedule: [],
      createdAt: new Date().toISOString()
    },
    { 
      id: 'emp_3', 
      name: 'Pierre Dubois', 
      email: 'pierre.dubois@example.com', 
      position: 'Commercial', 
      departmentId: 'dep_2', 
      role: 'employee',
      schedule: [],
      createdAt: new Date().toISOString()
    }
  ];
}

function getSampleProjects(): Project[] {
  return [
    { 
      id: 'proj_1', 
      code: 'PROJ1', 
      name: 'Refonte site web', 
      color: '#3b82f6',
      status: 'active'
    },
    { 
      id: 'proj_2', 
      code: 'PROJ2', 
      name: 'Application mobile', 
      color: '#22c55e',
      status: 'planned'
    },
    { 
      id: 'proj_3', 
      code: 'PROJ3', 
      name: 'Migration ERP', 
      color: '#f59e0b',
      status: 'active'
    }
  ];
}
