
import { Client } from '@/types';
import { STORAGE_KEYS, localStorageWrapper } from './base';

/**
 * Service for client storage operations
 */
export const clientStorageService = {
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
};
