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

interface TypeLabelsContextValue {
  getTypeLabel: (type: PropertyType) => string;
  typeLabels: Record<PropertyType, string>;
}

const TypeLabelsContext = createContext<TypeLabelsContextValue>({
  getTypeLabel: (type) => defaultTypeLabels[type],
  typeLabels: defaultTypeLabels,
});

export function TypeLabelsProvider({
  children,
  customLabels = {},
}: {
  children: React.ReactNode;
  customLabels?: TypeLabels;
}) {
  const typeLabels = { ...defaultTypeLabels, ...customLabels };

  const getTypeLabel = (type: PropertyType) => {
    return typeLabels[type] || type;
  };

  return (
    <TypeLabelsContext.Provider value={{ getTypeLabel, typeLabels }}>
      {children}
    </TypeLabelsContext.Provider>
  );
}

export function useTypeLabels() {
  return useContext(TypeLabelsContext);
}
