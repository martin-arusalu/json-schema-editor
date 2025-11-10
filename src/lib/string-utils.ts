// String utility functions

/**
 * Convert a string to snake_case format
 * Removes special characters and replaces spaces with underscores
 *
 * @example
 * toSnakeCase("User Name") // "user_name"
 * toSnakeCase("First Name!") // "first_name"
 */
export const toSnakeCase = (str: string): string => {
  return str
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // Remove special characters
    .replace(/\s+/g, "_"); // Replace spaces with underscores
};
