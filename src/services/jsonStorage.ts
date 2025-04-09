import { MonthData, Employee, Project, Status, DayStatus } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface JsonData {
  employees: Employee[];
  projects: Project[];
  statuses: Status[];
  planningData: MonthData;
}

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

let dataCache: JsonData | null = null;

export const loadData = (): JsonData => {
  if (dataCache) return dataCache;
  
  try {
    const savedData = localStorage.getItem('planningData');
    if (!savedData) {
      return defaultData;
    }
    
    const parsedData = JSON.parse(savedData);
    
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

export const saveData = (data: Partial<JsonData>): void => {
  try {
    const currentData = loadData();
    
    const updatedData: JsonData = {
      ...currentData,
      ...data,
      planningData: {
        ...currentData.planningData,
        ...(data.planningData || {}),
        employees: data.employees || currentData.planningData.employees,
        projects: data.projects || currentData.planningData.projects
      }
    };
    
    dataCache = updatedData;
    localStorage.setItem('planningData', JSON.stringify(updatedData));
    
    syncWithSupabase(updatedData);
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des données:", error);
  }
};

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
    
    const existingStatusIndex = employee.schedule.findIndex(
      (day) => day.date === dayStatus.date && day.period === dayStatus.period
    );
    
    let updatedSchedule = [...employee.schedule];
    
    if (existingStatusIndex >= 0) {
      if (dayStatus.status === '') {
        updatedSchedule.splice(existingStatusIndex, 1);
      } else {
        updatedSchedule[existingStatusIndex] = dayStatus;
      }
    } else if (dayStatus.status !== '') {
      updatedSchedule.push(dayStatus);
    }
    
    const updatedEmployee = {
      ...employee,
      schedule: updatedSchedule
    };
    
    return Boolean(employeeService.update(updatedEmployee));
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
  },
  
  updatePassword: (employeeId: string, password: string): boolean => {
    const data = loadData();
    const employeeIndex = data.employees.findIndex(emp => emp.id === employeeId);
    
    if (employeeIndex === -1) return false;
    
    const updatedEmployees = [...data.employees];
    updatedEmployees[employeeIndex] = {
      ...updatedEmployees[employeeIndex],
      password
    };
    
    saveData({ employees: updatedEmployees });
    return true;
  }
};

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

const syncWithSupabase = async (data: JsonData): Promise<void> => {
  try {
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

export const exportAllData = (): string => {
  return JSON.stringify(loadData(), null, 2);
};

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
