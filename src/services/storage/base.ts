
// Base storage service for generic localStorage operations

/**
 * Utility wrapper for localStorage operations with async API
 */
export const localStorageWrapper = {
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

export const STORAGE_KEYS = {
  EMPLOYEES: 'planning_employees',
  PROJECTS: 'planning_projects',
  STATUSES: 'planning_statuses',
  DEPARTMENTS: 'planning_departments',
  CLIENTS: 'planning_clients',
  SETTINGS: 'planning_settings',
  USER: 'user'
};

/**
 * Base storage service with generic methods
 */
export const baseStorageService = {
  getItem: localStorageWrapper.getItem,
  setItem: localStorageWrapper.setItem,
  removeItem: localStorageWrapper.removeItem,
};
