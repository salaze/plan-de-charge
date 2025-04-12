
/**
 * Generates a RFC4122 compliant UUID v4
 * This is compatible with PostgreSQL's uuid type
 */
export const generateId = (): string => {
  // Implementation of UUID v4 format using crypto for better randomness if available
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback implementation for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Checks if a string is a valid UUID v4 format
 */
export const isValidUuid = (id: string | null | undefined): boolean => {
  if (!id) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * Ensures a valid UUID is returned - either validates an existing ID or generates a new one
 * @param id Optional existing ID to validate
 * @returns A valid UUID (either the validated input or a new one)
 */
export const ensureValidUuid = (id?: string | null): string => {
  if (id && isValidUuid(id)) {
    return id;
  }
  return generateId();
};

/**
 * Creates a composite ID from multiple parts
 * Useful for logging or debugging, not for database IDs
 */
export const createCompositeId = (...parts: (string | number | undefined | null)[]): string => {
  return parts.filter(Boolean).join('_');
};
