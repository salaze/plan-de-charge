
import { Status } from '@/types';
import { STORAGE_KEYS, localStorageWrapper } from './base';

/**
 * Service for status storage operations
 */
export const statusStorageService = {
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
};

// Default status data (moved from the original file)
export function getDefaultStatuses(): Status[] {
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
