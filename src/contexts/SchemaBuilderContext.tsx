import { createContext, useContext } from "react";
import type { PropertyType } from "@/types/schema";

export type TypeLabels = Partial<Record<PropertyType, string>>;

const defaultTypeLabels: Record<PropertyType, string> = {
  string: "String",
  number: "Number",
  integer: "Integer",
  boolean: "Boolean",
  object: "Object",
  array: "Array",
  null: "Null",
  file: "File",
};

interface SchemaBuilderConfig {
  typeLabels?: TypeLabels;
  propertyLabel?: {
    singular: string;
    plural: string;
  };
  showRegex?: boolean;
  keyEditable?: boolean;
}

interface SchemaBuilderContextValue {
  getTypeLabel: (type: PropertyType) => string;
  typeLabels: Record<PropertyType, string>;
  propertyLabel: {
    singular: string;
    plural: string;
  };
  showRegex: boolean;
  keyEditable: boolean;
}

const defaultConfig: SchemaBuilderContextValue = {
  getTypeLabel: (type) => defaultTypeLabels[type],
  typeLabels: defaultTypeLabels,
  propertyLabel: { singular: "property", plural: "properties" },
  showRegex: false,
  keyEditable: false,
};

const SchemaBuilderContext = createContext<SchemaBuilderContextValue>(defaultConfig);

export function SchemaBuilderProvider({
  children,
  config = {},
}: {
  children: React.ReactNode;
  config?: SchemaBuilderConfig;
}) {
  const typeLabels = { ...defaultTypeLabels, ...config.typeLabels };
  const propertyLabel = config.propertyLabel || defaultConfig.propertyLabel;
  const showRegex = config.showRegex ?? defaultConfig.showRegex;
  const keyEditable = config.keyEditable ?? defaultConfig.keyEditable;

  const getTypeLabel = (type: PropertyType) => {
    return typeLabels[type] || type;
  };

  return (
    <SchemaBuilderContext.Provider
      value={{ getTypeLabel, typeLabels, propertyLabel, showRegex, keyEditable }}
    >
      {children}
    </SchemaBuilderContext.Provider>
  );
}

export function useSchemaBuilderConfig() {
  return useContext(SchemaBuilderContext);
}

// Backward compatibility export
export const useTypeLabels = () => {
  const { getTypeLabel, typeLabels } = useSchemaBuilderConfig();
  return { getTypeLabel, typeLabels };
};
