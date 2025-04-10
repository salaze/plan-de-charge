
import { employeeStorageService } from './employeeService';
import { statusStorageService } from './statusService';
import { departmentStorageService } from './departmentService';
import { projectStorageService } from './projectService';
import { 
  getSampleEmployees, 
  getSampleDepartments, 
  getSampleProjects 
} from './sampleDataService';
import { getDefaultStatuses } from './statusService';

/**
 * Service for initializing application data
 */
export const initStorageService = {
  /**
   * Initialize the application with sample data if needed
   */
  initializeData: async (): Promise<void> => {
    // Check if data already exists
    const employees = await employeeStorageService.getEmployees();
    const statuses = await statusStorageService.getStatuses();
    const departments = await departmentStorageService.getDepartments();
    const projects = await projectStorageService.getProjects();
    
    // If no employees, initialize with some sample data
    if (employees.length === 0) {
      await employeeStorageService.saveEmployees(getSampleEmployees());
    }
    
    // Initialize statuses if empty
    if (statuses.length === 0) {
      await statusStorageService.saveStatuses(getDefaultStatuses());
    }
    
    // Initialize departments if empty
    if (departments.length === 0) {
      await departmentStorageService.saveDepartments(getSampleDepartments());
    }
    
    // Initialize projects if empty
    if (projects.length === 0) {
      await projectStorageService.saveProjects(getSampleProjects());
    }
  }
};
