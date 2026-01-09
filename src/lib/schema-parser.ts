// JSON Schema parsing utilities

import { JSONSchema7 } from "json-schema";
import type { PropertyData, SchemaMetadata } from "@/types/schema";
import { generatePropertyId } from "./id-generator";

export interface ParsedSchema {
  properties: PropertyData[];
  metadata?: SchemaMetadata;
}

/**
 * Parse a JSON Schema into PropertyData array
 */
export const parseSchema = (schema: JSONSchema7): ParsedSchema => {
  const result: ParsedSchema = {
    properties: [],
  };

  // Extract metadata if present
  if (schema.title || schema.description || (schema as any).version) {
    result.metadata = {
      title: typeof schema.title === "string" ? schema.title : "",
      description:
        typeof schema.description === "string" ? schema.description : "",
      version:
        typeof (schema as any).version === "string"
          ? (schema as any).version
          : "1.0.0",
    };
  }

  // Parse properties
  if (schema.properties && typeof schema.properties === "object") {
    result.properties = parseProperties(
      schema.properties,
      Array.isArray(schema.required) ? schema.required : [],
    );
  }

  return result;
};

/**
 * Recursively parse properties from a JSON Schema
 */
export const parseProperties = (
  props: Record<string, JSONSchema7 | boolean>,
  requiredList: string[] = [],
): PropertyData[] => {
  if (!props) return [];

  return Object.entries(props)
    .filter(([, propSchema]) => typeof propSchema === "object")
    .map(([key, propSchema]) => {
      const schema = propSchema as JSONSchema7;

      // Determine the type - check for file type indicators
      let propertyType = (
        typeof schema.type === "string" ? schema.type : "string"
      ) as PropertyData["type"];

      // If it's a string with format filename, treat it as a file
      if (propertyType === "string" && schema.format === "filename") {
        propertyType = "file";
      }

      const property: PropertyData = {
        id: generatePropertyId(),
        key,
        title: typeof schema.title === "string" ? schema.title : undefined,
        type: propertyType,
        description:
          typeof schema.description === "string"
            ? schema.description
            : undefined,
        required: requiredList.includes(key),
      };

      // Parse string constraints
      if (schema.minLength !== undefined) property.minLength = schema.minLength;
      if (schema.maxLength !== undefined) property.maxLength = schema.maxLength;
      if (schema.pattern) property.pattern = schema.pattern;
      if (schema.enum && Array.isArray(schema.enum))
        property.enum = schema.enum as string[];

      // Parse numeric constraints
      if (schema.minimum !== undefined) property.minimum = schema.minimum;
      if (schema.maximum !== undefined) property.maximum = schema.maximum;

      // Parse array constraints
      if (schema.minItems !== undefined) property.minItems = schema.minItems;
      if (schema.maxItems !== undefined) property.maxItems = schema.maxItems;
      if (schema.uniqueItems) property.uniqueItems = schema.uniqueItems;

      // Parse array items recursively
      if (
        property.type === "array" &&
        schema.items &&
        typeof schema.items === "object" &&
        !Array.isArray(schema.items)
      ) {
        property.items = parseProperties(
          { item: schema.items as JSONSchema7 },
          [],
        ).find((p) => p.key === "item");
      }

      // Parse object children recursively
      if (schema.properties && typeof schema.properties === "object") {
        property.children = parseProperties(
          schema.properties,
          Array.isArray(schema.required) ? schema.required : [],
        );
      }

      return property;
    });
};
