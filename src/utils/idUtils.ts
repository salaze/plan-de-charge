
/**
 * Generates a UUID v4 compliant unique identifier
 * This is compatible with Supabase PostgreSQL UUID type
 */
export const generateId = (): string => {
  // Implementation of UUID v4 format
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0,
        v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Checks if a string is a valid UUID format
 */
export const isValidUuid = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * Ensures a valid UUID is returned - either validates an existing ID or generates a new one
 */
export const ensureValidUuid = (id?: string): string => {
  if (id && isValidUuid(id)) {
    return id;
  }
  return generateId();
};
