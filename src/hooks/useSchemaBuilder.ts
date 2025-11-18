// Custom hook for managing schema builder state and operations

import { useState, useMemo } from "react";
import type { PropertyData, SchemaMetadata } from "@/types/schema";
import { generateSchema } from "@/lib/schema-generator";
import { parseSchema } from "@/lib/schema-parser";
import { importJsonFile, downloadJsonFile } from "@/lib/file-utils";
import { generatePropertyId } from "@/lib/id-generator";

export interface UseSchemaBuilderReturn {
  properties: PropertyData[];
  metadata: SchemaMetadata;
  schema: any;
  addProperty: () => PropertyData;
  updateProperty: (id: string, updated: PropertyData) => void;
  deleteProperty: (id: string) => void;
  clearAll: () => void;
  updateMetadata: (field: keyof SchemaMetadata, value: string) => void;
  importSchema: () => Promise<void>;
  downloadSchema: () => void;
  loadSchema: (schema: any) => void;
}

export const useSchemaBuilder = (
  includeMetadata: boolean = true,
): UseSchemaBuilderReturn => {
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [metadata, setMetadata] = useState<SchemaMetadata>({
    title: "",
    description: "",
    version: "",
  });

  // Generate schema from current state - memoized to prevent unnecessary recalculations
  const schema = useMemo(
    () => generateSchema(properties, metadata, includeMetadata),
    [properties, metadata, includeMetadata],
  );

  // Add a new property
  const addProperty = (): PropertyData => {
    const property: PropertyData = {
      id: generatePropertyId(),
      key: "",
      type: "string",
      required: false,
    };
    return property;
  };

  // Update an existing property or add it if it doesn't exist
  const updateProperty = (id: string, updated: PropertyData) => {
    setProperties((prev) => {
      const exists = prev.some((p) => p.id === id);
      if (exists) {
        return prev.map((p) => (p.id === id ? updated : p));
      } else {
        // If property doesn't exist, add it
        return [...prev, updated];
      }
    });
  };

  // Delete a property
  const deleteProperty = (id: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
  };

  // Clear all properties and reset metadata
  const clearAll = () => {
    setProperties([]);
    setMetadata({ title: "", description: "", version: "" });
  };

  // Update metadata field
  const updateMetadata = (field: keyof SchemaMetadata, value: string) => {
    setMetadata((prev) => ({ ...prev, [field]: value }));
  };

  // Import schema from file
  const importSchema = async () => {
    const data = await importJsonFile();
    const parsed = parseSchema(data);

    setProperties(parsed.properties);
    if (parsed.metadata && includeMetadata) {
      setMetadata(parsed.metadata);
    }
  };

  // Download schema as file
  const downloadSchema = () => {
    downloadJsonFile(schema, "schema.json");
  };

  // Load schema programmatically
  const loadSchema = (schemaData: any) => {
    const parsed = parseSchema(schemaData);
    setProperties(parsed.properties);
    if (parsed.metadata && includeMetadata) {
      setMetadata(parsed.metadata);
    }
  };

  return {
    properties,
    metadata,
    schema,
    addProperty,
    updateProperty,
    deleteProperty,
    clearAll,
    updateMetadata,
    importSchema,
    downloadSchema,
    loadSchema,
  };
};
