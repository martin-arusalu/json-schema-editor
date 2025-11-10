// ID generation utilities

/**
 * Generate a unique ID for properties
 * Uses timestamp and random number for uniqueness
 *
 * @example
 * generatePropertyId() // "1699632000000-0.123456789"
 */
export const generatePropertyId = (): string => {
  return `${Date.now()}-${Math.random()}`;
};
