// JSON Schema generation utilities

import type { PropertyData, SchemaMetadata } from "@/types/schema";
import { JSONSchema7 } from "json-schema";

/**
 * Generate a JSON Schema from property definitions
 */
export const generateSchema = (
  properties: PropertyData[],
  metadata?: SchemaMetadata,
  includeMetadata: boolean = true,
): JSONSchema7 => {
  const schema: JSONSchema7 = {
    type: "object",
  };

  // Add metadata if enabled and provided
  if (includeMetadata && metadata) {
    if (metadata.title) schema.title = metadata.title;
    if (metadata.description) schema.description = metadata.description;
    if (metadata.version) (schema as any).version = metadata.version;
  }

  // Build properties recursively
  const props = buildProperties(properties);
  if (Object.keys(props).length > 0) {
    schema.properties = props;
  }

  // Add required array at root level
  const required = properties
    .filter((p) => p.required && p.key)
    .map((p) => p.key);
  if (required.length > 0) {
    schema.required = required;
  }

  return schema;
};

/**
 * Recursively build property schemas
 */
const buildProperties = (
  props: PropertyData[],
): Record<string, JSONSchema7> => {
  const result: Record<string, JSONSchema7> = {};

  props.forEach((prop) => {
    if (!prop.key) return;

    // Convert 'file' type to string with format = filename for JSON Schema compliance
    const schemaType = prop.type === "file" ? "string" : prop.type;
    const propSchema: JSONSchema7 = { type: schemaType };

    // Add common fields
    if (prop.title) propSchema.title = prop.title;
    if (prop.description) propSchema.description = prop.description;

    // For file type, add format to indicate special content
    if (prop.type === "file") {
      propSchema.format = "filename";
    }

    // String constraints
    if (prop.type === "string") {
      if (prop.minLength !== undefined) propSchema.minLength = prop.minLength;
      if (prop.maxLength !== undefined) propSchema.maxLength = prop.maxLength;
      if (prop.pattern) propSchema.pattern = prop.pattern;
      if (prop.enum && prop.enum.length > 0) propSchema.enum = prop.enum;
    }

    // Numeric constraints
    if (prop.type === "number" || prop.type === "integer") {
      if (prop.minimum !== undefined) propSchema.minimum = prop.minimum;
      if (prop.maximum !== undefined) propSchema.maximum = prop.maximum;
    }

    // Array constraints
    if (prop.type === "array") {
      if (prop.minItems !== undefined) propSchema.minItems = prop.minItems;
      if (prop.maxItems !== undefined) propSchema.maxItems = prop.maxItems;
      if (prop.uniqueItems) propSchema.uniqueItems = prop.uniqueItems;

      // Add items schema recursively
      if (prop.items) {
        propSchema.items = buildProperties([prop.items])[prop.items.key] || {
          type: prop.items.type,
        };
      }
    }

    // Object properties and required fields
    if (prop.type === "object" && prop.children && prop.children.length > 0) {
      propSchema.properties = buildProperties(prop.children);
      const requiredChildren = prop.children
        .filter((c) => c.required && c.key)
        .map((c) => c.key);
      if (requiredChildren.length > 0) {
        propSchema.required = requiredChildren;
      }
    }

    result[prop.key] = propSchema;
  });

  return result;
};
