import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pencil,
  Trash2,
  Plus,
  Type,
  List,
  Hash,
  Braces,
  CheckSquare,
  FileText,
} from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PropertyEditDialog from "./PropertyEditDialog";
import type { PropertyData, PropertyType } from "@/types/schema";
import { useTypeLabels } from "@/contexts/TypeLabelsContext";
import { useInlineEditor } from "@/hooks/useInlineEditor";
import { useTypeSelector } from "@/hooks/useTypeSelector";
import { useChildManager } from "@/hooks/useChildManager";
import { useDialogManager } from "@/hooks/useDialogManager";

interface PropertyDocumentProps {
  property: PropertyData;
  onUpdate: (property: PropertyData) => void;
  onDelete: () => void;
  level?: number;
  isArrayItem?: boolean;
  showRegex?: boolean;
  keyEditable?: boolean;
}

export default function PropertyDocument({
  property,
  onUpdate,
  onDelete,
  level = 1,
  isArrayItem = false,
  showRegex = false,
  keyEditable = false,
}: PropertyDocumentProps) {
  const { getTypeLabel, typeLabels } = useTypeLabels();

  // Dialog for editing this property
  const editDialog = useDialogManager<PropertyData>();

  // Inline editing for title
  const titleEditor = useInlineEditor(
    property.title || property.key || "",
    (newValue) => onUpdate({ ...property, title: newValue }),
    { allowEmpty: false },
  );

  // Inline editing for description
  const descriptionEditor = useInlineEditor(
    property.description || "",
    (newValue) => onUpdate({ ...property, description: newValue || undefined }),
    { allowEmpty: true },
  );

  // Type selection with constraint cleanup
  const typeSelector = useTypeSelector(property, onUpdate);

  // Child property management
  const childManager = useChildManager(property, onUpdate);

  const HeadingTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
  const canHaveChildren = property.type === "object";
  const hasChildren =
    canHaveChildren && property.children && property.children.length > 0;

  const headingClasses =
    {
      1: "text-lg font-semibold",
      2: "text-base",
      3: "text-base",
      4: "text-base",
      5: "text-sm",
      6: "text-sm",
    }[level] || "text-sm";

  return (
    <div className="group">
      <div className="flex gap-4 items-center rounded-md -mx-2 px-2 py-1 transition-colors hover:bg-accent/50">
        {/* Left side - Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            {!isArrayItem && (
              <button
                onClick={() =>
                  onUpdate({ ...property, required: !property.required })
                }
                className="shrink-0 transition-all hover:scale-110 mt-0.5"
                title={
                  property.required
                    ? "Required field - click to make optional"
                    : "Optional field - click to make required"
                }
              >
                {property.required ? (
                  <span className="block w-4 h-4 rounded-full bg-primary"></span>
                ) : (
                  <span className="block w-4 h-4 rounded-full border border-dashed border-gray-400"></span>
                )}
              </button>
            )}

            {titleEditor.isEditing ? (
              <Input
                value={titleEditor.value}
                onChange={(e) => titleEditor.handleChange(e.target.value)}
                onBlur={titleEditor.handleBlur}
                onKeyDown={titleEditor.handleKeyDown}
                autoFocus
                className={headingClasses}
                placeholder="Enter title"
              />
            ) : (
              <div className="flex gap-2 flex-wrap flex-1">
                <div className="flex items-start gap-2">
                  <HeadingTag
                    className={`${headingClasses} cursor-pointer hover:text-primary transition-colors leading-none`}
                    onClick={titleEditor.startEdit}
                  >
                    {property.title || property.key || (
                      <span className="text-muted-foreground italic">
                        unnamed
                      </span>
                    )}
                  </HeadingTag>
                  {typeSelector.isChangingType ? (
                    <Select
                      value={property.type}
                      onValueChange={(value) =>
                        typeSelector.handleTypeChange(value as PropertyType)
                      }
                      open={typeSelector.isChangingType}
                      onOpenChange={typeSelector.setIsChangingType}
                    >
                      <SelectTrigger className="w-[140px] h-7">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {typeSelector.availableTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {typeLabels[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => typeSelector.setIsChangingType(true)}
                            className="cursor-pointer hover:bg-accent rounded p-0.5 transition-colors"
                          >
                            {property.type === "string" && (
                              <Type className="w-5 h-5 text-muted-foreground" />
                            )}
                            {property.type === "number" && (
                              <Hash className="w-5 h-5 text-muted-foreground" />
                            )}
                            {property.type === "integer" && (
                              <Hash className="w-5 h-5 text-muted-foreground" />
                            )}
                            {property.type === "boolean" && (
                              <CheckSquare className="w-5 h-5 text-muted-foreground" />
                            )}
                            {property.type === "object" && (
                              <Braces className="w-5 h-5 text-muted-foreground" />
                            )}
                            {property.type === "array" && (
                              <List className="w-5 h-5 text-muted-foreground" />
                            )}
                            {property.type === "file" && (
                              <FileText className="w-5 h-5 text-muted-foreground" />
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {getTypeLabel(property.type)}
                          {property.type === "array" && property.items
                            ? ` of ${getTypeLabel(property.items.type)}`
                            : ""}
                          <div className="text-xs text-muted-foreground mt-1">
                            Click to change type
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {property.type === "object" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 h-6 w-6"
                      onClick={childManager.addChild}
                      data-testid={`button-add-child-${property.id}`}
                    >
                      <Plus className="!w-5 !h-5" />
                    </Button>
                  )}
                </div>
                <div className="flex-1">
                  {descriptionEditor.isEditing ? (
                    <Input
                      value={descriptionEditor.value}
                      onChange={(e) =>
                        descriptionEditor.handleChange(e.target.value)
                      }
                      onBlur={descriptionEditor.handleBlur}
                      onKeyDown={descriptionEditor.handleKeyDown}
                      autoFocus
                      className="text-sm flex-1"
                      placeholder="Enter description"
                    />
                  ) : (
                    <>
                      {property.description ? (
                        <p
                          className="text-sm text-muted-foreground flex-1 min-w-[200px] cursor-pointer hover:text-foreground transition-colors"
                          data-testid={`text-description-${property.id}`}
                          onClick={descriptionEditor.startEdit}
                        >
                          {property.description}
                        </p>
                      ) : (
                        <p
                          className="text-sm text-muted-foreground/50 flex-1 min-w-[200px] cursor-pointer hover:text-muted-foreground italic transition-colors"
                          onClick={descriptionEditor.startEdit}
                        >
                          Add description...
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => editDialog.open(property)}
            data-testid={`button-edit-${property.id}`}
          >
            <Pencil className="w-3 h-3" />
          </Button>
          {/* Only show add-child button on right for non-object types (shouldn't happen, but for safety) */}
          {canHaveChildren && property.type !== "object" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={childManager.addChild}
              data-testid={`button-add-child-${property.id}`}
            >
              <Plus className="w-3 h-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={onDelete}
            data-testid={`button-delete-${property.id}`}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Render children for objects */}
      {hasChildren && (
        <div
          className={
            level === 1
              ? "ml-6 mt-1 border-l-2 border-border pl-6"
              : "ml-4 mt-1 border-l border-border pl-4"
          }
        >
          {property.children!.map((child) => (
            <PropertyDocument
              key={child.id}
              property={child}
              onUpdate={(updated) =>
                childManager.updateChild(child.id, updated)
              }
              onDelete={() => childManager.deleteChild(child.id)}
              level={level + 1}
              showRegex={showRegex}
              keyEditable={keyEditable}
            />
          ))}
        </div>
      )}

      {/* Render items for arrays recursively */}
      {property.type === "array" && property.items && (
        <div
          className={
            level === 1
              ? "ml-6 mt-1 border-l-2 border-border pl-6"
              : "ml-4 mt-1 border-l border-border pl-4"
          }
        >
          <div className="mb-2 text-xs text-muted-foreground font-semibold uppercase">
            {getTypeLabel("array")} Items
          </div>
          <PropertyDocument
            property={property.items}
            onUpdate={(updated) => onUpdate({ ...property, items: updated })}
            onDelete={() => onUpdate({ ...property, items: undefined })}
            level={level + 1}
            isArrayItem={true}
            showRegex={showRegex}
            keyEditable={keyEditable}
          />
        </div>
      )}

      <PropertyEditDialog
        property={editDialog.data || property}
        open={editDialog.isOpen}
        onOpenChange={editDialog.setIsOpen}
        onSave={(updated) => {
          onUpdate(updated);
          editDialog.close();
        }}
        isArrayItem={isArrayItem}
        isNewProperty={false}
        showRegex={showRegex}
        keyEditable={keyEditable}
      />

      {childManager.addChildDialog.isOpen &&
        childManager.addChildDialog.data && (
          <PropertyEditDialog
            property={childManager.addChildDialog.data}
            open={childManager.addChildDialog.isOpen}
            isNewProperty={true}
            onOpenChange={childManager.addChildDialog.setIsOpen}
            onSave={childManager.addChildDialog.confirm}
            showRegex={showRegex}
            keyEditable={keyEditable}
          />
        )}
    </div>
  );
}
