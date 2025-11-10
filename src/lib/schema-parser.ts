// JSON Schema parsing utilities

import type { PropertyData, SchemaMetadata } from "@/types/schema";
import { generatePropertyId } from "./id-generator";

export interface ParsedSchema {
  properties: PropertyData[];
  metadata?: SchemaMetadata;
}

/**
 * Parse a JSON Schema into PropertyData array
 */
export const parseSchema = (schema: any): ParsedSchema => {
  const result: ParsedSchema = {
    properties: [],
  };

  // Extract metadata if present
  if (schema.title || schema.description) {
    result.metadata = {
      title: schema.title || "",
      description: schema.description || "",
      version: "1.0.0", // Default version
    };
  }

  // Parse properties
  if (schema.properties) {
    result.properties = parseProperties(
      schema.properties,
      schema.required || [],
    );
  }

  return result;
};

/**
 * Recursively parse properties from a JSON Schema
 */
export const parseProperties = (
  props: any,
  requiredList: string[] = [],
): PropertyData[] => {
  if (!props) return [];

  return Object.entries(props).map(([key, propSchema]: [string, any]) => {
    const property: PropertyData = {
      id: generatePropertyId(),
      key,
      title: propSchema.title,
      type: propSchema.type || "string",
      description: propSchema.description,
      required: requiredList.includes(key),
      constraints: {},
    };

    // Parse string constraints
    if (propSchema.minLength !== undefined)
      property.constraints.minLength = propSchema.minLength;
    if (propSchema.maxLength !== undefined)
      property.constraints.maxLength = propSchema.maxLength;
    if (propSchema.pattern) property.constraints.pattern = propSchema.pattern;
    if (propSchema.enum && Array.isArray(propSchema.enum))
      property.constraints.enum = propSchema.enum;

    // Parse numeric constraints
    if (propSchema.minimum !== undefined)
      property.constraints.minimum = propSchema.minimum;
    if (propSchema.maximum !== undefined)
      property.constraints.maximum = propSchema.maximum;

    // Parse array constraints
    if (propSchema.minItems !== undefined)
      property.constraints.minItems = propSchema.minItems;
    if (propSchema.maxItems !== undefined)
      property.constraints.maxItems = propSchema.maxItems;
    if (propSchema.uniqueItems)
      property.constraints.uniqueItems = propSchema.uniqueItems;

    // Parse array items recursively
    if (propSchema.type === "array" && propSchema.items) {
      property.items = parseProperties({ item: propSchema.items }, []).find(
        (p) => p.key === "item",
      );
    }

    // Parse object children recursively
    if (propSchema.properties) {
      property.children = parseProperties(
        propSchema.properties,
        propSchema.required || [],
      );
    }

    return property;
  });
};
