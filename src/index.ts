/**
 * @packageDocumentation
 * JSON Schema Builder - A React component library for building JSON schemas visually
 */

// Main component
export { JsonSchemaBuilder } from "./components/JsonSchemaBuilder";
export type { JsonSchemaBuilderProps } from "./components/JsonSchemaBuilder";

// Standalone property editor dialog
export { default as PropertyEditDialog } from "./components/PropertyEditDialog";

// Types needed for the component props
export type { TypeLabels } from "./contexts/SchemaBuilderContext";
export type { PropertyData, PropertyType } from "./types/schema";
