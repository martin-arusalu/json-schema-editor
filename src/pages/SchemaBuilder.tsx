import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Trash2 } from "lucide-react";
import PropertyDocument from "@/components/PropertyDocument";
import PropertyEditDialog from "@/components/PropertyEditDialog";
import JsonOutput from "@/components/JsonOutput";
import SchemaMetadata from "@/components/SchemaMetadata";
import ThemeToggle from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { FEATURES } from "@/config/features";
import type { PropertyData } from "@/types/schema";
import { useSchemaBuilder } from "@/hooks/useSchemaBuilder";

export default function SchemaBuilder() {
  const [newProperty, setNewProperty] = useState<PropertyData | null>(null);
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const { toast } = useToast();

  const {
    properties,
    metadata,
    schema,
    addProperty: createProperty,
    updateProperty,
    deleteProperty,
    clearAll: clearAllProperties,
    updateMetadata,
    importSchema,
    downloadSchema,
  } = useSchemaBuilder(FEATURES.ENABLE_METADATA);

  const addProperty = () => {
    const property = createProperty();
    setNewProperty(property);
    setIsAddingProperty(true);
  };

  const confirmAddProperty = (property: PropertyData) => {
    updateProperty(property.id, property);
    setIsAddingProperty(false);
    setNewProperty(null);
  };

  const cancelAddProperty = () => {
    setIsAddingProperty(false);
    setNewProperty(null);
  };

  const clearAll = () => {
    clearAllProperties();
    toast({
      title: "Cleared",
      description: "All properties have been removed",
    });
  };

  const handleImport = async () => {
    try {
      await importSchema();
      toast({
        title: "Imported",
        description: "Schema loaded successfully",
      });
    } catch (err) {
      toast({
        title: "Import failed",
        description:
          err instanceof Error ? err.message : "Invalid JSON schema file",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="h-16 border-b flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleImport}
            data-testid="button-import"
          >
            <Upload className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
            disabled={properties.length === 0}
            data-testid="button-clear"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-3/5 border-r overflow-auto p-6 space-y-4">
          {FEATURES.ENABLE_METADATA && (
            <SchemaMetadata
              title={metadata.title}
              description={metadata.description}
              version={metadata.version}
              onUpdate={(field, value) =>
                updateMetadata(field as keyof typeof metadata, value)
              }
            />
          )}

          {properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-medium mb-2">No properties yet</h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Start building your JSON schema by adding your first property
              </p>
              <Button onClick={addProperty} data-testid="button-add-first">
                <Plus className="w-4 h-4 mr-2" />
                Add Property
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-8">
                {properties.map((property) => (
                  <PropertyDocument
                    key={property.id}
                    property={property}
                    onUpdate={(updated) => updateProperty(property.id, updated)}
                    onDelete={() => deleteProperty(property.id)}
                  />
                ))}
              </div>

              <div className="pt-6">
                <Button
                  onClick={addProperty}
                  className="w-full"
                  variant="outline"
                  data-testid="button-add-property"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Property
                </Button>
              </div>

              <div className="pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {properties.length}{" "}
                  {properties.length === 1 ? "property" : "properties"}
                </span>
                <span>
                  {properties.filter((p) => p.required).length} required
                </span>
              </div>
            </>
          )}
        </div>

        <div className="w-2/5">
          <JsonOutput schema={schema} />
        </div>
      </div>

      {isAddingProperty && newProperty && (
        <PropertyEditDialog
          property={newProperty}
          open={isAddingProperty}
          onOpenChange={(open) => {
            if (!open) {
              if (newProperty.key) {
                confirmAddProperty(newProperty);
              } else {
                cancelAddProperty();
              }
            }
          }}
          onUpdate={setNewProperty}
        />
      )}
    </div>
  );
}
