
import { Project } from '@/types';
import { STORAGE_KEYS, localStorageWrapper } from './base';

/**
 * Service for project storage operations
 */
export const projectStorageService = {
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
};
