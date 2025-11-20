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
import type { TypeLabels } from "@/contexts/TypeLabelsContext";
import { useState, useEffect } from "react";

/**
 * PropertyEditDialog - A standalone dialog for editing a single JSON schema property
 *
 * @example
 * ```tsx
 * import { PropertyEditDialog } from 'json-schema-builder-react';
 *
 * function MyApp() {
 *   const [isOpen, setIsOpen] = useState(false);
 *   const [property, setProperty] = useState({
 *     id: '1',
 *     key: 'username',
 *     title: 'Username',
 *     type: 'string',
 *     required: true,
 *   });
 *
 *   return (
 *     <PropertyEditDialog
 *       property={property}
 *       open={isOpen}
 *       onOpenChange={setIsOpen}
 *       onSave={(updated) => {
 *         setProperty(updated);
 *         setIsOpen(false);
 *       }}
 *       typeLabels={{ string: 'Text', number: 'Number' }}
 *     />
 *   );
 * }
 * ```
 */
interface PropertyEditDialogProps {
  property: PropertyData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (property: PropertyData) => void;
  isArrayItem?: boolean;
  isNewProperty?: boolean;
  propertyLabel?: { singular: string; plural: string };
  showRegex?: boolean;
  keyEditable?: boolean;
  typeLabels?: TypeLabels;
}

export default function PropertyEditDialog({
  property,
  open,
  onOpenChange,
  onSave,
  isArrayItem = false,
  isNewProperty = false,
  propertyLabel = { singular: "Property", plural: "Properties" },
  showRegex = false,
  keyEditable = false,
  typeLabels: customTypeLabels,
}: PropertyEditDialogProps) {
  const { typeLabels: contextTypeLabels } = useTypeLabels();

  // Use custom typeLabels if provided, otherwise fall back to context
  const typeLabels = customTypeLabels || contextTypeLabels;

  // Local state for editing
  const [localProperty, setLocalProperty] = useState<PropertyData>(property);

  // Reset local state when property or open changes
  useEffect(() => {
    if (open) {
      setLocalProperty(property);
    }
  }, [property, open]);

  const {
    handleTitleChange,
    handleTitleBlur,
    handleKeyChange,
    handleFieldChange,
    handleConstraintChange,
  } = usePropertyEditor(
    localProperty,
    setLocalProperty,
    isNewProperty,
    keyEditable,
  );

  const handleSave = () => {
    if (localProperty.title?.trim()) {
      onSave(localProperty);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setLocalProperty(property); // Reset to original
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[80vh] flex flex-col gap-0 p-0"
        data-testid="dialog-edit-property"
      >
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle>
            {isNewProperty
              ? `Add ${propertyLabel.singular}`
              : `Edit ${propertyLabel.singular}`}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 px-6 pb-4 overflow-y-auto flex-1 min-h-0">
          {/* 1. Property Type */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              Type
            </Label>
            <Select
              value={localProperty.type}
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
            <Label className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              Title
            </Label>
            <Input
              value={localProperty.title || ""}
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={handleTitleBlur}
              placeholder="Property Title"
              data-testid="input-title-dialog"
              required
            />
            {!isNewProperty && localProperty.key && (
              <p className="text-xs text-muted-foreground font-mono">
                Key: {localProperty.key}
              </p>
            )}
          </div>

          {/* 3. Property Key - Shown for new properties or when keyEditable is true */}
          {(isNewProperty || keyEditable) && (
            <div className="space-y-2">
              <Label>Key</Label>
              <Input
                value={localProperty.key}
                onChange={(e) => handleKeyChange(e.target.value)}
                placeholder="property_key"
                data-testid="input-key-dialog"
              />
              {!isNewProperty && (
                <p className="text-xs text-yellow-600 dark:text-yellow-500">
                  ⚠️ Changing the key may break existing references to this
                  property
                </p>
              )}
            </div>
          )}

          {/* 4. Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Optional description"
              value={localProperty.description || ""}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              rows={2}
              data-testid="input-edit-description"
            />
          </div>

          {/* Recursive array item editing (inline, not modal) */}
          {localProperty.type === "array" && (
            <div className="space-y-2 border-l-2 border-border pl-4 mt-2">
              <Label className="font-semibold text-xs text-muted-foreground">
                {typeLabels.array} Items
              </Label>
              {localProperty.items ? (
                <div className="bg-muted/40 p-2 rounded">
                  {/* Inline editing for array item schema */}
                  <div className="space-y-2">
                    <Label>Item Type</Label>
                    <Select
                      value={localProperty.items.type}
                      onValueChange={(value) =>
                        setLocalProperty({
                          ...localProperty,
                          items: {
                            ...localProperty.items!,
                            type: value as PropertyType,
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">
                          {typeLabels.string}
                        </SelectItem>
                        <SelectItem value="number">
                          {typeLabels.number}
                        </SelectItem>
                        <SelectItem value="integer">
                          {typeLabels.integer}
                        </SelectItem>
                        <SelectItem value="boolean">
                          {typeLabels.boolean}
                        </SelectItem>
                        <SelectItem value="object">
                          {typeLabels.object}
                        </SelectItem>
                        <SelectItem value="array">
                          {typeLabels.array}
                        </SelectItem>
                        <SelectItem value="file">{typeLabels.file}</SelectItem>
                        <SelectItem value="null">{typeLabels.null}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Item Title</Label>
                    <Input
                      value={localProperty.items.title || ""}
                      onChange={(e) =>
                        setLocalProperty({
                          ...localProperty,
                          items: {
                            ...localProperty.items!,
                            title: e.target.value,
                          },
                        })
                      }
                      placeholder="Item Title"
                    />
                  </div>
                  {/* Item key is fixed and not editable */}
                  {/* You can add more inline controls for constraints, etc. */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() =>
                      setLocalProperty({ ...localProperty, items: undefined })
                    }
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
                    setLocalProperty({
                      ...localProperty,
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

          {!isArrayItem && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="prop-required"
                checked={localProperty.required}
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

          {localProperty.type === "string" && (
            <details className="border rounded-md">
              <summary className="p-4 cursor-pointer hover:bg-accent/50 transition-colors">
                <h4 className="text-sm font-medium inline">
                  {typeLabels.string} Constraints
                </h4>
              </summary>
              <div className="space-y-4 p-4 pt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min-length">Minimum Length</Label>
                    <Input
                      id="min-length"
                      type="number"
                      placeholder="0"
                      value={localProperty.minLength || ""}
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
                      value={localProperty.maxLength || ""}
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
                {showRegex && (
                  <div className="space-y-2">
                    <Label htmlFor="pattern">Pattern (regex)</Label>
                    <Input
                      id="pattern"
                      placeholder="^[a-z]+$"
                      value={localProperty.pattern || ""}
                      onChange={(e) =>
                        handleConstraintChange("pattern", e.target.value)
                      }
                      className="font-mono text-sm"
                      data-testid="input-edit-pattern"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Enum Values</Label>
                  <div className="space-y-2">
                    {[...(localProperty.enum || []), ""].map((value, index) => (
                      <Input
                        key={index}
                        placeholder={
                          index === (localProperty.enum?.length || 0)
                            ? "Add new value..."
                            : "Enum value"
                        }
                        value={value}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          const currentEnum = localProperty.enum || [];

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
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter allowed values (empty fields will be removed)
                  </p>
                </div>
              </div>
            </details>
          )}

          {(localProperty.type === "number" ||
            localProperty.type === "integer") && (
            <details className="border rounded-md">
              <summary className="p-4 cursor-pointer hover:bg-accent/50 transition-colors">
                <h4 className="text-sm font-medium inline">
                  Numeric Constraints
                </h4>
              </summary>
              <div className="space-y-4 p-4 pt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minimum">Minimum Value</Label>
                    <Input
                      id="minimum"
                      type="number"
                      placeholder="-∞"
                      value={localProperty.minimum ?? ""}
                      onChange={(e) =>
                        handleConstraintChange(
                          "minimum",
                          e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
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
                      value={localProperty.maximum ?? ""}
                      onChange={(e) =>
                        handleConstraintChange(
                          "maximum",
                          e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        )
                      }
                      data-testid="input-edit-maximum"
                    />
                  </div>
                </div>
              </div>
            </details>
          )}

          {localProperty.type === "array" && (
            <details className="border rounded-md">
              <summary className="p-4 cursor-pointer hover:bg-accent/50 transition-colors">
                <h4 className="text-sm font-medium inline">
                  {typeLabels.array} Constraints
                </h4>
              </summary>
              <div className="space-y-4 p-4 pt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min-items">Minimum Items</Label>
                    <Input
                      id="min-items"
                      type="number"
                      placeholder="0"
                      value={localProperty.minItems || ""}
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
                      value={localProperty.maxItems || ""}
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
                    checked={localProperty.uniqueItems || false}
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
            </details>
          )}
        </div>
        <DialogFooter className="px-6 py-4 border-t bg-background shrink-0">
          <Button
            variant="outline"
            onClick={handleCancel}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            data-testid="button-save"
            disabled={!localProperty.title?.trim()}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
