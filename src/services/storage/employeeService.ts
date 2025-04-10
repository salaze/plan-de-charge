import { Employee } from '@/types';
import { STORAGE_KEYS, localStorageWrapper } from './base';
import { generateId } from '@/utils/idUtils';

/**
 * Service for employee storage operations
 */
export const employeeStorageService = {
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
    const employees = await employeeStorageService.getEmployees();
    const newEmployee: Employee = {
      ...employee,
      id: generateId(),
      schedule: employee.schedule || [],
      createdAt: new Date().toISOString()
    };
    
    employees.push(newEmployee);
    await employeeStorageService.saveEmployees(employees);
    return newEmployee;
  },

  updateEmployee: async (employee: Employee): Promise<Employee> => {
    const employees = await employeeStorageService.getEmployees();
    const index = employees.findIndex(e => e.id === employee.id);
    
    if (index !== -1) {
      employees[index] = employee;
      await employeeStorageService.saveEmployees(employees);
    }
    
    return employee;
  },

  deleteEmployee: async (id: string): Promise<boolean> => {
    const employees = await employeeStorageService.getEmployees();
    const newEmployees = employees.filter(employee => employee.id !== id);
    
    if (newEmployees.length !== employees.length) {
      await employeeStorageService.saveEmployees(newEmployees);
      return true;
    }
    
    return false;
  },
};
