// Domain types for JSON Schema Builder

export type PropertyType =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "object"
  | "array"
  | "null";

export interface PropertyConstraints {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minimum?: number;
  maximum?: number;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  enum?: string[];
}

export interface PropertyData {
  id: string;
  key: string;
  title?: string;
  type: PropertyType;
  description?: string;
  required: boolean;
  constraints: PropertyConstraints;
  children?: PropertyData[];
  items?: PropertyData; // For arrays: schema of items (recursive)
}

export interface SchemaMetadata {
  title: string;
  description: string;
  version: string;
}
