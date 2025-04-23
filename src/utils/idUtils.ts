
// General utility functions for ID generation and date formatting

/**
 * Generates a UUID v4 compatible with Supabase
 */
export const generateId = (): string => {
  // Création d'un UUID v4 valide
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
