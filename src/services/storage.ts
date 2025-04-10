
// This file is kept for backwards compatibility
// It re-exports everything from the new modular structure
import { storageService as newStorageService, STORAGE_KEYS } from './storage/index';
import { generateId } from '@/lib/utils';

// Re-export the entire service with the same structure as before
export const storageService = newStorageService;

// Re-export the storage keys
export { STORAGE_KEYS };
