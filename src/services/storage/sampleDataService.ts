import { Department, Employee, Project } from '@/types';
import { generateId } from '@/utils/idUtils'; // Direct import from the source

/**
 * Generate sample departments for application initialization
 */
export function getSampleDepartments(): Department[] {
  return [
    { id: 'dep_1', name: 'Technique', color: '#3b82f6' },
    { id: 'dep_2', name: 'Commercial', color: '#22c55e' },
    { id: 'dep_3', name: 'Administration', color: '#8b5cf6' },
    { id: 'dep_4', name: 'Ressources Humaines', color: '#f59e0b' }
  ];
}

/**
 * Generate sample employees for application initialization
 */
export function getSampleEmployees(): Employee[] {
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

/**
 * Generate sample projects for application initialization
 */
export function getSampleProjects(): Project[] {
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
