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
  Asterisk,
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
import { useSchemaBuilderConfig } from "@/contexts/SchemaBuilderContext";
import { useInlineEditor } from "@/hooks/useInlineEditor";
import { useTypeSelector } from "@/hooks/useTypeSelector";
import { useChildManager } from "@/hooks/useChildManager";
import { useDialogManager } from "@/hooks/useDialogManager";
import { cn } from "@/lib/utils";

interface PropertyDocumentProps {
  property: PropertyData;
  onUpdate: (property: PropertyData) => void;
  onDelete: () => void;
  level?: number;
  isArrayItem?: boolean;
}

export default function PropertyDocument({
  property,
  onUpdate,
  onDelete,
  level = 1,
  isArrayItem = false,
}: PropertyDocumentProps) {
  const { getTypeLabel, typeLabels, showRegex, keyEditable } =
    useSchemaBuilderConfig();

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
  const typeClasses =
    {
      1: "h-5 w-5",
      2: "h-4 w-4",
      3: "h-4 w-4",
      4: "h-4 w-4",
      5: "h-4 w-4",
      6: "h-4 w-4",
    }[level] || "h-5 w-5";

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
                className="shrink-0 transition-all hover:scale-110 -mt-[3px]"
                title={
                  property.required
                    ? "Required field - click to make optional"
                    : "Optional field - click to make required"
                }
              >
                {property.required ? (
                  // <span className="block w-4 h-4 rounded-full bg-primary"></span>
                  <Asterisk className="w-6 h-6 text-primary" />
                ) : (
                  // <span className="block w-4 h-4 rounded-full border border-dashed border-gray-400"></span>
                  <Asterisk className="w-6 h-6 text-border" />
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
                            className="cursor-pointer hover:bg-accent rounded p-0.5 -mt-0.5 transition-colors"
                          >
                            {property.type === "string" && (
                              <Type
                                className={cn(
                                  typeClasses,
                                  "text-muted-foreground",
                                )}
                              />
                            )}
                            {property.type === "number" && (
                              <Hash
                                className={cn(
                                  typeClasses,
                                  "text-muted-foreground",
                                )}
                              />
                            )}
                            {property.type === "integer" && (
                              <Hash
                                className={cn(
                                  typeClasses,
                                  "text-muted-foreground",
                                )}
                              />
                            )}
                            {property.type === "boolean" && (
                              <CheckSquare
                                className={cn(
                                  typeClasses,
                                  "text-muted-foreground",
                                )}
                              />
                            )}
                            {property.type === "object" && (
                              <Braces
                                className={cn(
                                  typeClasses,
                                  "text-muted-foreground",
                                )}
                              />
                            )}
                            {property.type === "array" && (
                              <List
                                className={cn(
                                  typeClasses,
                                  "text-muted-foreground",
                                )}
                              />
                            )}
                            {property.type === "file" && (
                              <FileText
                                className={cn(
                                  typeClasses,
                                  "text-muted-foreground",
                                )}
                              />
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
                      className="h-4 w-4"
                      onClick={childManager.addChild}
                      data-testid={`button-add-child-${property.id}`}
                    >
                      <Plus />
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
      />

      {childManager.addChildDialog.isOpen &&
        childManager.addChildDialog.data && (
          <PropertyEditDialog
            property={childManager.addChildDialog.data}
            open={childManager.addChildDialog.isOpen}
            isNewProperty={true}
            onOpenChange={childManager.addChildDialog.setIsOpen}
            onSave={childManager.addChildDialog.confirm}
          />
        )}
    </div>
  );
}
