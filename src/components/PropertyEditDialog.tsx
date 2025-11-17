import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import type { PropertyData, PropertyType } from "@/types/schema";
import { usePropertyEditor } from "@/hooks/usePropertyEditor";
import { useTypeLabels } from "@/contexts/TypeLabelsContext";

interface PropertyEditDialogProps {
  property: PropertyData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (property: PropertyData) => void;
  isArrayItem?: boolean;
  isNewProperty?: boolean;
}

export default function PropertyEditDialog({
  property,
  open,
  onOpenChange,
  onUpdate,
  isArrayItem = false,
  isNewProperty = false,
}: PropertyEditDialogProps) {
  const { typeLabels } = useTypeLabels();
  const {
    handleTitleChange,
    handleTitleBlur,
    handleKeyChange,
    handleFieldChange,
    handleConstraintChange,
  } = usePropertyEditor(property, onUpdate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[80vh] overflow-y-auto"
        data-testid="dialog-edit-property"
      >
        <DialogHeader>
          <DialogTitle>
            {isNewProperty ? "Add Property" : "Edit Property"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 pt-4">
          {/* 1. Property Type */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              Type
            </Label>
            <Select
              value={property.type}
              onValueChange={(value) => handleFieldChange("type", value)}
              data-testid="select-type-dialog"
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="string">{typeLabels.string}</SelectItem>
                <SelectItem value="number">{typeLabels.number}</SelectItem>
                <SelectItem value="integer">{typeLabels.integer}</SelectItem>
                <SelectItem value="boolean">{typeLabels.boolean}</SelectItem>
                <SelectItem value="object">{typeLabels.object}</SelectItem>
                <SelectItem value="array">{typeLabels.array}</SelectItem>
                <SelectItem value="file">{typeLabels.file}</SelectItem>
                <SelectItem value="null">{typeLabels.null}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 2. Property Title */}
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={property.title || ""}
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={handleTitleBlur}
              placeholder="Property Title"
              data-testid="input-title-dialog"
            />
            {!isNewProperty && property.key && (
              <p className="text-xs text-muted-foreground font-mono">
                Key: {property.key}
              </p>
            )}
          </div>

          {/* 3. Property Key - Only shown for new properties */}
          {isNewProperty && (
            <div className="space-y-2">
              <Label>Key</Label>
              <Input
                value={property.key}
                onChange={(e) => handleKeyChange(e.target.value)}
                placeholder="property_key"
                data-testid="input-key-dialog"
              />
            </div>
          )}

          {/* 4. Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Optional description"
              value={property.description || ""}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              rows={2}
              data-testid="input-edit-description"
            />
          </div>

          {/* Recursive array item editing (inline, not modal) */}
          {property.type === "array" && (
            <div className="space-y-2 border-l-2 border-border pl-4 mt-2">
              <Label className="font-semibold text-xs text-muted-foreground">
                {typeLabels.array} Items
              </Label>
              {property.items ? (
                <div className="bg-muted/40 p-2 rounded">
                  {/* Inline editing for array item schema */}
                  <div className="space-y-2">
                    <Label>Item Type</Label>
                    <Select
                      value={property.items.type}
                      onValueChange={(value) =>
                        onUpdate({
                          ...property,
                          items: {
                            ...property.items!,
                            type: value as PropertyType,
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">{typeLabels.string}</SelectItem>
                        <SelectItem value="number">{typeLabels.number}</SelectItem>
                        <SelectItem value="integer">{typeLabels.integer}</SelectItem>
                        <SelectItem value="boolean">{typeLabels.boolean}</SelectItem>
                        <SelectItem value="object">{typeLabels.object}</SelectItem>
                        <SelectItem value="array">{typeLabels.array}</SelectItem>
                        <SelectItem value="file">{typeLabels.file}</SelectItem>
                        <SelectItem value="null">{typeLabels.null}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Item Title</Label>
                    <Input
                      value={property.items.title || ""}
                      onChange={(e) =>
                        onUpdate({
                          ...property,
                          items: { ...property.items!, title: e.target.value },
                        })
                      }
                      placeholder="Item Title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Item Key</Label>
                    <Input
                      value={property.items.key || "item"}
                      onChange={(e) =>
                        onUpdate({
                          ...property,
                          items: { ...property.items!, key: e.target.value },
                        })
                      }
                      placeholder="item"
                    />
                  </div>
                  {/* You can add more inline controls for constraints, etc. */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => onUpdate({ ...property, items: undefined })}
                  >
                    Remove {typeLabels.array} Item Schema
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Default to string type for new item
                    onUpdate({
                      ...property,
                      items: {
                        id: Date.now().toString() + Math.random(),
                        key: "item",
                        type: "string",
                        required: false,
                      },
                    });
                  }}
                >
                  Add {typeLabels.array} Item Schema
                </Button>
              )}
            </div>
          )}
        </div>

        {!isArrayItem && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="prop-required"
              checked={property.required}
              onCheckedChange={(checked) =>
                handleFieldChange("required", checked)
              }
              data-testid="checkbox-edit-required"
            />
            <Label htmlFor="prop-required" className="cursor-pointer">
              Required field
            </Label>
          </div>
        )}

        {property.type === "string" && (
          <div className="space-y-4 p-4 border rounded-md">
            <h4 className="text-sm font-medium">{typeLabels.string} Constraints</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-length">Minimum Length</Label>
                <Input
                  id="min-length"
                  type="number"
                  placeholder="0"
                  value={property.minLength || ""}
                  onChange={(e) =>
                    handleConstraintChange(
                      "minLength",
                      e.target.value ? parseInt(e.target.value) : undefined,
                    )
                  }
                  data-testid="input-edit-minlength"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-length">Maximum Length</Label>
                <Input
                  id="max-length"
                  type="number"
                  placeholder="∞"
                  value={property.maxLength || ""}
                  onChange={(e) =>
                    handleConstraintChange(
                      "maxLength",
                      e.target.value ? parseInt(e.target.value) : undefined,
                    )
                  }
                  data-testid="input-edit-maxlength"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pattern">Pattern (regex)</Label>
              <Input
                id="pattern"
                placeholder="^[a-z]+$"
                value={property.pattern || ""}
                onChange={(e) =>
                  handleConstraintChange("pattern", e.target.value)
                }
                className="font-mono text-sm"
                data-testid="input-edit-pattern"
              />
            </div>
            <div className="space-y-2">
              <Label>Enum Values</Label>
              <div className="space-y-2">
                {[...(property.enum || []), ""].map(
                  (value, index) => (
                    <Input
                      key={index}
                      placeholder={
                        index === (property.enum?.length || 0)
                          ? "Add new value..."
                          : "Enum value"
                      }
                      value={value}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        const currentEnum = property.enum || [];

                        if (index === currentEnum.length) {
                          // Adding new value to the placeholder input
                          if (newValue.trim()) {
                            handleConstraintChange("enum", [
                              ...currentEnum,
                              newValue.trim(),
                            ]);
                          }
                        } else {
                          // Updating existing value
                          if (newValue.trim()) {
                            const newEnum = [...currentEnum];
                            newEnum[index] = newValue.trim();
                            handleConstraintChange("enum", newEnum);
                          } else {
                            // Removing empty value
                            const newEnum = currentEnum.filter(
                              (_, i) => i !== index,
                            );
                            handleConstraintChange(
                              "enum",
                              newEnum.length > 0 ? newEnum : undefined,
                            );
                          }
                        }
                      }}
                      data-testid={`input-edit-enum-${index}`}
                    />
                  ),
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Enter allowed values (empty fields will be removed)
              </p>
            </div>
          </div>
        )}

        {(property.type === "number" || property.type === "integer") && (
          <div className="space-y-4 p-4 border rounded-md">
            <h4 className="text-sm font-medium">Numeric Constraints</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minimum">Minimum Value</Label>
                <Input
                  id="minimum"
                  type="number"
                  placeholder="-∞"
                  value={property.minimum ?? ""}
                  onChange={(e) =>
                    handleConstraintChange(
                      "minimum",
                      e.target.value ? parseFloat(e.target.value) : undefined,
                    )
                  }
                  data-testid="input-edit-minimum"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maximum">Maximum Value</Label>
                <Input
                  id="maximum"
                  type="number"
                  placeholder="∞"
                  value={property.maximum ?? ""}
                  onChange={(e) =>
                    handleConstraintChange(
                      "maximum",
                      e.target.value ? parseFloat(e.target.value) : undefined,
                    )
                  }
                  data-testid="input-edit-maximum"
                />
              </div>
            </div>
          </div>
        )}

        {property.type === "array" && (
          <div className="space-y-4 p-4 border rounded-md">
            <h4 className="text-sm font-medium">{typeLabels.array} Constraints</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min-items">Minimum Items</Label>
                <Input
                  id="min-items"
                  type="number"
                  placeholder="0"
                  value={property.minItems || ""}
                  onChange={(e) =>
                    handleConstraintChange(
                      "minItems",
                      e.target.value ? parseInt(e.target.value) : undefined,
                    )
                  }
                  data-testid="input-edit-minitems"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-items">Maximum Items</Label>
                <Input
                  id="max-items"
                  type="number"
                  placeholder="∞"
                  value={property.maxItems || ""}
                  onChange={(e) =>
                    handleConstraintChange(
                      "maxItems",
                      e.target.value ? parseInt(e.target.value) : undefined,
                    )
                  }
                  data-testid="input-edit-maxitems"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="unique-items"
                checked={property.uniqueItems || false}
                onCheckedChange={(checked) =>
                  handleConstraintChange("uniqueItems", checked)
                }
                data-testid="checkbox-edit-unique"
              />
              <Label htmlFor="unique-items" className="cursor-pointer">
                All items must be unique
              </Label>
            </div>
          </div>
        )}
        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)} data-testid="button-save">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
