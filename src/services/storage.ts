
// This file is kept for backwards compatibility
// It re-exports everything from the new modular structure
import { storageService as newStorageService, STORAGE_KEYS } from './storage/index';
import { generateId } from '@/utils/idUtils';  // Direct import from the source

// Re-export the entire service with the same structure as before
export const storageService = newStorageService;

// Re-export the storage keys
export { STORAGE_KEYS };

// Re-export the generateId function
export { generateId };
