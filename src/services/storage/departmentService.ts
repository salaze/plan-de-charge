
import { Department } from '@/types';
import { STORAGE_KEYS, localStorageWrapper } from './base';

/**
 * Service for department storage operations
 */
export const departmentStorageService = {
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
};
