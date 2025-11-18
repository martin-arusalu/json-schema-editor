// Domain types for JSON Schema Builder

import type { JSONSchema7TypeName } from "json-schema";

// Use JSON Schema's type definitions with custom extensions
export type PropertyType = JSONSchema7TypeName | "file";

/**
 * Internal UI representation of a JSON Schema property
 * This extends JSONSchema7 with additional metadata needed for the builder UI
 */
export interface PropertyData {
  // UI-specific fields
  id: string; // Internal ID for React keys
  key: string; // Property name/key in the schema
  required: boolean; // Whether this property is in the required array

  // JSON Schema fields (subset for simplicity)
  type: PropertyType;
  title?: string;
  description?: string;

  // Validation constraints (from JSON Schema)
  // String validation
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  enum?: string[];

  // Numeric validation
  minimum?: number;
  maximum?: number;

  // Array validation
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  items?: PropertyData; // For arrays: schema of items (recursive)

  // Object validation
  children?: PropertyData[]; // For objects: nested properties
}

// Schema metadata (not part of JSON Schema spec, but commonly used)
export interface SchemaMetadata {
  title: string;
  description: string;
  version: string;
}
