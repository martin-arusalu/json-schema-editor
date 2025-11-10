import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Trash2 } from "lucide-react";
import PropertyDocument, { PropertyData } from "@/components/PropertyDocument";
import PropertyEditDialog from "@/components/PropertyEditDialog";
import JsonOutput from "@/components/JsonOutput";
import SchemaMetadata from "@/components/SchemaMetadata";
import ThemeToggle from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { FEATURES } from "@/config/features";

export default function SchemaBuilder() {
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [metadata, setMetadata] = useState({
    title: "",
    description: "",
    version: "1.0.0",
  });
  const [newProperty, setNewProperty] = useState<PropertyData | null>(null);
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const { toast } = useToast();

  const generateSchema = () => {
    const schema: any = {
      $schema: "http://json-schema.org/draft-07/schema#",
      type: "object",
    };

    if (FEATURES.ENABLE_METADATA) {
      if (metadata.title) schema.title = metadata.title;
      if (metadata.description) schema.description = metadata.description;
    }

    const buildProperties = (props: PropertyData[]): any => {
      const result: any = {};
      props.forEach((prop) => {
        if (!prop.key) return;

        const propSchema: any = { type: prop.type };

        if (prop.title) propSchema.title = prop.title;
        if (prop.description) propSchema.description = prop.description;

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

        if (prop.type === "number" || prop.type === "integer") {
          if (prop.constraints.minimum !== undefined)
            propSchema.minimum = prop.constraints.minimum;
          if (prop.constraints.maximum !== undefined)
            propSchema.maximum = prop.constraints.maximum;
        }

        if (prop.type === "array") {
          if (prop.constraints.minItems !== undefined)
            propSchema.minItems = prop.constraints.minItems;
          if (prop.constraints.maxItems !== undefined)
            propSchema.maxItems = prop.constraints.maxItems;
          if (prop.constraints.uniqueItems)
            propSchema.uniqueItems = prop.constraints.uniqueItems;
          // Add items schema recursively
          if (prop.items) {
            propSchema.items = buildProperties([prop.items])[
              prop.items.key
            ] || { type: prop.items.type };
          }
        }

        if (
          prop.type === "object" &&
          prop.children &&
          prop.children.length > 0
        ) {
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

    const props = buildProperties(properties);
    if (Object.keys(props).length > 0) {
      schema.properties = props;
    }

    const required = properties
      .filter((p) => p.required && p.key)
      .map((p) => p.key);
    if (required.length > 0) {
      schema.required = required;
    }

    return schema;
  };

  const addProperty = () => {
    const property: PropertyData = {
      id: Date.now().toString(),
      key: "",
      type: "string",
      required: false,
      constraints: {},
    };
    setNewProperty(property);
    setIsAddingProperty(true);
  };

  const confirmAddProperty = (property: PropertyData) => {
    setProperties([...properties, property]);
    setIsAddingProperty(false);
    setNewProperty(null);
  };

  const cancelAddProperty = () => {
    setIsAddingProperty(false);
    setNewProperty(null);
  };

  const updateProperty = (id: string, updated: PropertyData) => {
    setProperties(properties.map((p) => (p.id === id ? updated : p)));
  };

  const deleteProperty = (id: string) => {
    setProperties(properties.filter((p) => p.id !== id));
  };

  const clearAll = () => {
    setProperties([]);
    setMetadata({ title: "", description: "", version: "1.0.0" });
    toast({
      title: "Cleared",
      description: "All properties have been removed",
    });
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const schema = JSON.parse(event.target?.result as string);

          if (FEATURES.ENABLE_METADATA) {
            if (schema.title)
              setMetadata((prev) => ({ ...prev, title: schema.title }));
            if (schema.description)
              setMetadata((prev) => ({
                ...prev,
                description: schema.description,
              }));
          }

          const parseProperties = (
            props: any,
            requiredList: string[] = [],
          ): PropertyData[] => {
            if (!props) return [];

            return Object.entries(props).map(
              ([key, propSchema]: [string, any]) => {
                const property: PropertyData = {
                  id: Date.now().toString() + Math.random(),
                  key,
                  title: propSchema.title,
                  type: propSchema.type || "string",
                  description: propSchema.description,
                  required: requiredList.includes(key),
                  constraints: {},
                };

                if (propSchema.minLength !== undefined)
                  property.constraints.minLength = propSchema.minLength;
                if (propSchema.maxLength !== undefined)
                  property.constraints.maxLength = propSchema.maxLength;
                if (propSchema.pattern)
                  property.constraints.pattern = propSchema.pattern;
                if (propSchema.enum && Array.isArray(propSchema.enum))
                  property.constraints.enum = propSchema.enum;
                if (propSchema.minimum !== undefined)
                  property.constraints.minimum = propSchema.minimum;
                if (propSchema.maximum !== undefined)
                  property.constraints.maximum = propSchema.maximum;
                if (propSchema.minItems !== undefined)
                  property.constraints.minItems = propSchema.minItems;
                if (propSchema.maxItems !== undefined)
                  property.constraints.maxItems = propSchema.maxItems;
                if (propSchema.uniqueItems)
                  property.constraints.uniqueItems = propSchema.uniqueItems;

                // Parse array items recursively
                if (propSchema.type === "array" && propSchema.items) {
                  property.items = parseProperties(
                    { item: propSchema.items },
                    [],
                  ).find((p) => p.key === "item");
                }

                if (propSchema.properties) {
                  property.children = parseProperties(
                    propSchema.properties,
                    propSchema.required || [],
                  );
                }

                return property;
              },
            );
          };

          const importedProps = parseProperties(
            schema.properties,
            schema.required || [],
          );
          setProperties(importedProps);

          toast({
            title: "Imported",
            description: "Schema loaded successfully",
          });
        } catch (err) {
          toast({
            title: "Import failed",
            description: "Invalid JSON schema file",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const schema = generateSchema();

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
                setMetadata({ ...metadata, [field]: value })
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
