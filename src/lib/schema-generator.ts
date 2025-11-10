// JSON Schema generation utilities

import type { PropertyData, SchemaMetadata } from "@/types/schema";

/**
 * Generate a JSON Schema from property definitions
 */
export const generateSchema = (
  properties: PropertyData[],
  metadata?: SchemaMetadata,
  includeMetadata: boolean = true,
): any => {
  const schema: any = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
  };

  // Add metadata if enabled and provided
  if (includeMetadata && metadata) {
    if (metadata.title) schema.title = metadata.title;
    if (metadata.description) schema.description = metadata.description;
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
const buildProperties = (props: PropertyData[]): any => {
  const result: any = {};

  props.forEach((prop) => {
    if (!prop.key) return;

    const propSchema: any = { type: prop.type };

    // Add common fields
    if (prop.title) propSchema.title = prop.title;
    if (prop.description) propSchema.description = prop.description;

    // String constraints
    if (prop.type === "string") {
      if (prop.constraints.minLength !== undefined)
        propSchema.minLength = prop.constraints.minLength;
      if (prop.constraints.maxLength !== undefined)
        propSchema.maxLength = prop.constraints.maxLength;
      if (prop.constraints.pattern)
        propSchema.pattern = prop.constraints.pattern;
      if (prop.constraints.enum && prop.constraints.enum.length > 0)
        propSchema.enum = prop.constraints.enum;
    }

    // Numeric constraints
    if (prop.type === "number" || prop.type === "integer") {
      if (prop.constraints.minimum !== undefined)
        propSchema.minimum = prop.constraints.minimum;
      if (prop.constraints.maximum !== undefined)
        propSchema.maximum = prop.constraints.maximum;
    }

    // Array constraints
    if (prop.type === "array") {
      if (prop.constraints.minItems !== undefined)
        propSchema.minItems = prop.constraints.minItems;
      if (prop.constraints.maxItems !== undefined)
        propSchema.maxItems = prop.constraints.maxItems;
      if (prop.constraints.uniqueItems)
        propSchema.uniqueItems = prop.constraints.uniqueItems;

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
