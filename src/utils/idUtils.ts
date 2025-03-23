
// General utility functions for ID generation and date formatting

/**
 * Generates a unique identifier
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};
