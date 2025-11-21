import { Button } from "@/components/ui/button";
import { Plus, Upload, Trash2 } from "lucide-react";
import PropertyDocument from "@/components/PropertyDocument";
import PropertyEditDialog from "@/components/PropertyEditDialog";
import JsonOutput from "@/components/JsonOutput";
import SchemaMetadata from "@/components/SchemaMetadata";
import type {
  PropertyData,
  SchemaMetadata as SchemaMetadataType,
} from "@/types/schema";
import { useSchemaBuilder } from "@/hooks/useSchemaBuilder";
import { useDialogManager } from "@/hooks/useDialogManager";
import ThemeToggle from "./ThemeToggle";
import {
  SchemaBuilderProvider,
  type TypeLabels,
} from "@/contexts/SchemaBuilderContext";

export interface JsonSchemaBuilderProps {
  /**
   * The JSON schema object (controlled)
   */
  schema: any;

  /**
   * Callback fired when the schema changes
   */
  onChange: (schema: any) => void;

  /**
   * Whether to show metadata fields (title, description, version)
   * @default false
   */
  showMetadata?: boolean;

  /**
   * Whether to show the import button
   * @default true
   */
  showImport?: boolean;

  /**
   * Whether to show the clear all button
   * @default true
   */
  showClear?: boolean;

  /**
   * Whether to show the JSON output panel
   * @default true
   */
  showOutput?: boolean;

  /**
   * Custom class name for the container
   */
  className?: string;

  showHeader?: boolean;

  /**
   * Custom labels for property types
   * @example { string: 'Text', boolean: 'Yes/No', object: 'Form', array: 'List' }
   */
  typeLabels?: TypeLabels;

  /**
   * Whether to show summary in the bottom of the document area
   * @default true
   */
  showSummary?: boolean;

  /**
   * Custom label for top-level properties
   * @example { singular: 'input', plural: 'inputs' }
   * @default { singular: 'property', plural: 'properties' }
   */
  propertyLabel?: {
    singular: string;
    plural: string;
  };

  /**
   * Whether to show the regex pattern field in string constraints
   * @default false
   */
  showRegex?: boolean;

  /**
   * Whether to allow editing property keys after initialization
   * @default false
   */
  keyEditable?: boolean;
}

/**
 * A visual JSON Schema builder component that allows building JSON schemas interactively
 */
export function JsonSchemaBuilder({
  schema,
  onChange,
  showMetadata = false,
  showImport = true,
  showClear = true,
  showOutput = true,
  showHeader = true,
  className = "",
  showSummary = false,
  typeLabels,
  propertyLabel = { singular: "property", plural: "properties" },
  showRegex = false,
  keyEditable = false,
}: JsonSchemaBuilderProps) {
  const {
    properties,
    metadata,
    addProperty: createProperty,
    updateProperty,
    deleteProperty,
    clearAll: clearAllProperties,
    updateMetadata,
    importSchema,
  } = useSchemaBuilder({
    schema,
    onChange,
    includeMetadata: showMetadata,
  });

  const addPropertyDialog = useDialogManager<PropertyData>({
    createInitialData: () => createProperty(),
    onConfirm: (property) => {
      updateProperty(property.id, property);
    },
  });

  const clearAll = () => {
    clearAllProperties();
  };

  const handleImport = async () => {
    await importSchema();
  };

  return (
    <SchemaBuilderProvider
      config={{
        typeLabels,
        propertyLabel,
        showRegex,
        keyEditable,
      }}
    >
      <div className={`${className} flex flex-col json-schema-builder-react`}>
        {showHeader && (
          <header className="h-16 border-b flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              {showImport && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleImport}
                  data-testid="button-import"
                >
                  <Upload className="w-4 h-4" />
                </Button>
              )}
              {showClear && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAll}
                  disabled={properties.length === 0}
                  data-testid="button-clear"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <ThemeToggle />
            </div>
          </header>
        )}

        <div className="flex-1 flex overflow-hidden">
          <div className={showOutput ? "w-3/5 border-r" : "w-full"}>
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-auto p-2 space-y-4">
                {showMetadata && (
                  <SchemaMetadata
                    title={metadata.title}
                    description={metadata.description}
                    version={metadata.version}
                    onUpdate={(field, value) =>
                      updateMetadata(field as keyof SchemaMetadataType, value)
                    }
                  />
                )}

                {properties.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Plus className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-lg font-medium mb-2">
                      No {propertyLabel.plural} yet
                    </h2>
                    <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                      Start building your JSON schema by adding your first{" "}
                      {propertyLabel.singular}
                    </p>
                    <Button
                      onClick={() => addPropertyDialog.open()}
                      data-testid="button-add-first"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add {propertyLabel.singular}
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      {properties.map((property) => (
                        <PropertyDocument
                          key={property.id}
                          property={property}
                          onUpdate={(updated) =>
                            updateProperty(property.id, updated)
                          }
                          onDelete={() => deleteProperty(property.id)}
                        />
                      ))}
                    </div>

                    {showSummary && (
                      <div className="pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          {properties.length}{" "}
                          {properties.length === 1
                            ? propertyLabel.singular
                            : propertyLabel.plural}
                        </span>
                        <span>
                          {properties.filter((p) => p.required).length} required
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {properties.length > 0 && (
                <div className="border-t p-2 pt-4 bg-background">
                  <Button
                    onClick={() => addPropertyDialog.open()}
                    className="w-full"
                    variant="outline"
                    data-testid="button-add-property"
                  >
                    <Plus className="w-4 h-4" />
                    Add {propertyLabel.singular}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {showOutput && (
            <div className="w-2/5">
              <JsonOutput schema={schema} />
            </div>
          )}
        </div>

        {addPropertyDialog.isOpen && addPropertyDialog.data && (
          <PropertyEditDialog
            property={addPropertyDialog.data}
            open={addPropertyDialog.isOpen}
            isNewProperty={true}
            onOpenChange={addPropertyDialog.setIsOpen}
            onSave={addPropertyDialog.confirm}
          />
        )}
      </div>
    </SchemaBuilderProvider>
  );
}
