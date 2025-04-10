
import { baseStorageService, STORAGE_KEYS } from './base';
import { employeeStorageService } from './employeeService';
import { projectStorageService } from './projectService';
import { statusStorageService } from './statusService';
import { departmentStorageService } from './departmentService';
import { clientStorageService } from './clientService';
import { initStorageService } from './initService';

/**
 * Main storage service that combines all storage-related operations
 */
export const storageService = {
  // Base methods
  getItem: baseStorageService.getItem,
  setItem: baseStorageService.setItem,
  removeItem: baseStorageService.removeItem,

  // Employee methods
  getEmployees: employeeStorageService.getEmployees,
  saveEmployees: employeeStorageService.saveEmployees,
  addEmployee: employeeStorageService.addEmployee,
  updateEmployee: employeeStorageService.updateEmployee,
  deleteEmployee: employeeStorageService.deleteEmployee,

  // Project methods
  getProjects: projectStorageService.getProjects,
  saveProjects: projectStorageService.saveProjects,

  // Department methods
  getDepartments: departmentStorageService.getDepartments,
  saveDepartments: departmentStorageService.saveDepartments,

  // Status methods
  getStatuses: statusStorageService.getStatuses,
  saveStatuses: statusStorageService.saveStatuses,

  // Client methods
  getClients: clientStorageService.getClients,
  saveClients: clientStorageService.saveClients,

  // Initialize data
  initializeData: initStorageService.initializeData
};

// Re-export constants for external use
export { STORAGE_KEYS };

// For backwards compatibility, re-export some helper functions
export { 
  getDefaultStatuses 
} from './statusService';

export { 
  getSampleDepartments, 
  getSampleEmployees, 
  getSampleProjects 
} from './sampleDataService';
