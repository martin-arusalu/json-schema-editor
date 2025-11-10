import { useState, useEffect } from "react";
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
  AlignLeft,
} from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import PropertyEditDialog from "./PropertyEditDialog";

export type PropertyType =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "object"
  | "array"
  | "null";

export interface PropertyData {
  id: string;
  key: string;
  title?: string;
  type: PropertyType;
  description?: string;
  required: boolean;
  constraints: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    minimum?: number;
    maximum?: number;
    minItems?: number;
    maxItems?: number;
    uniqueItems?: boolean;
    enum?: string[];
  };
  children?: PropertyData[];
  items?: PropertyData; // For arrays: schema of items (recursive)
}

// Convert title to snake_case for property key
const toSnakeCase = (str: string): string => {
  return str
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // Remove special characters
    .replace(/\s+/g, "_"); // Replace spaces with underscores
};

interface PropertyDocumentProps {
  property: PropertyData;
  onUpdate: (property: PropertyData) => void;
  onDelete: () => void;
  level?: number;
}

export default function PropertyDocument({
  property,
  onUpdate,
  onDelete,
  level = 1,
}: PropertyDocumentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newChild, setNewChild] = useState<PropertyData | null>(null);
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(property.title || "");
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [editedKey, setEditedKey] = useState(property.key || "");

  // Keep editedTitle in sync with property.title
  useEffect(() => {
    if (!isEditingTitle) {
      setEditedTitle(property.title || "");
    }
  }, [property.title, isEditingTitle]);

  // Keep editedKey in sync with property.key
  useEffect(() => {
    if (!isEditingKey) {
      setEditedKey(property.key || "");
    }
  }, [property.key, isEditingKey]);

  const HeadingTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
  const canHaveChildren = property.type === "object";
  const hasChildren =
    canHaveChildren && property.children && property.children.length > 0;

  const headingClasses =
    {
      1: "text-2xl font-semibold",
      2: "text-xl font-semibold",
      3: "text-lg font-medium",
      4: "text-base font-medium",
      5: "text-sm font-medium",
      6: "text-sm font-medium",
    }[level] || "text-sm font-medium";

  const updateChild = (childId: string, updated: PropertyData) => {
    const newChildren = property.children!.map((c) =>
      c.id === childId ? updated : c,
    );
    onUpdate({ ...property, children: newChildren });
  };

  const deleteChild = (childId: string) => {
    const newChildren = property.children!.filter((c) => c.id !== childId);
    onUpdate({ ...property, children: newChildren });
  };

  const addChild = () => {
    const child: PropertyData = {
      id: Date.now().toString() + Math.random(),
      key: "",
      type: "string",
      required: false,
      constraints: {},
    };
    setNewChild(child);
    setIsAddingChild(true);
  };

  const confirmAddChild = (child: PropertyData) => {
    onUpdate({
      ...property,
      children: [...(property.children || []), child],
    });
    setIsAddingChild(false);
    setNewChild(null);
  };

  const cancelAddChild = () => {
    setIsAddingChild(false);
    setNewChild(null);
  };

  const handleTitleClick = () => {
    const currentTitle = property.title || property.key || "";
    setEditedTitle(currentTitle);
    setIsEditingTitle(true);
  };

  const handleTitleBlur = () => {
    if (editedTitle !== property.title) {
      const updates: Partial<PropertyData> = { title: editedTitle };

      // Always auto-regenerate key from title
      if (editedTitle) {
        const autoKey = toSnakeCase(editedTitle);
        updates.key = autoKey;
      }

      onUpdate({ ...property, ...updates });
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTitleBlur();
    } else if (e.key === "Escape") {
      setEditedTitle(property.title || "");
      setIsEditingTitle(false);
    }
  };

  const handleKeyBlur = () => {
    if (editedKey !== property.key) {
      onUpdate({ ...property, key: editedKey });
    }
    setIsEditingKey(false);
  };

  return (
    <div className="group">
      <div className="flex gap-4 items-start">
        {/* Left side - Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() =>
                onUpdate({ ...property, required: !property.required })
              }
              className="shrink-0 transition-all hover:scale-110"
              title={
                property.required
                  ? "Required field - click to make optional"
                  : "Optional field - click to make required"
              }
            >
              {property.required ? (
                <span className="block w-4 h-4 rounded-full bg-red-500"></span>
              ) : (
                <span className="block w-4 h-4 rounded-full border-2 border-dashed border-gray-400"></span>
              )}
            </button>

            {isEditingTitle ? (
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                autoFocus
                className={headingClasses}
                placeholder="Enter title"
              />
            ) : (
              <div className="flex items-center gap-2">
                <HeadingTag
                  className={`${headingClasses} cursor-pointer hover:text-primary transition-colors`}
                  onClick={handleTitleClick}
                >
                  {property.title || property.key || (
                    <span className="text-muted-foreground italic">
                      unnamed
                    </span>
                  )}
                </HeadingTag>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        {property.type === "string" && (
                          <Type className="w-4 h-4 text-muted-foreground" />
                        )}
                        {property.type === "number" && (
                          <Hash className="w-4 h-4 text-muted-foreground" />
                        )}
                        {property.type === "integer" && (
                          <Hash className="w-4 h-4 text-muted-foreground" />
                        )}
                        {property.type === "boolean" && (
                          <CheckSquare className="w-4 h-4 text-muted-foreground" />
                        )}
                        {property.type === "object" && (
                          <Braces className="w-4 h-4 text-muted-foreground" />
                        )}
                        {property.type === "array" && (
                          <List className="w-4 h-4 text-muted-foreground" />
                        )}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      {property.type}
                      {property.type === "array" && property.items
                        ? ` of ${property.items.type}`
                        : ""}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {property.type === "object" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 h-6 w-6"
                    onClick={addChild}
                    data-testid={`button-add-child-${property.id}`}
                  >
                    <Plus className="!w-5 !h-5" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {property.description && (
            <p
              className="text-sm text-muted-foreground mb-2"
              data-testid={`text-description-${property.id}`}
            >
              {property.description}
            </p>
          )}
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsEditing(true)}
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
              onClick={addChild}
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
              ? "ml-6 mt-4 space-y-6 border-l-2 border-border pl-6"
              : "ml-4 mt-3 space-y-4 border-l border-border pl-4"
          }
        >
          {property.children!.map((child) => (
            <PropertyDocument
              key={child.id}
              property={child}
              onUpdate={(updated) => updateChild(child.id, updated)}
              onDelete={() => deleteChild(child.id)}
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
              ? "ml-6 mt-4 border-l-2 border-border pl-6"
              : "ml-4 mt-3 border-l border-border pl-4"
          }
        >
          <div className="mb-2 text-xs text-muted-foreground font-semibold uppercase">
            Array Items
          </div>
          <PropertyDocument
            property={property.items}
            onUpdate={(updated) => onUpdate({ ...property, items: updated })}
            onDelete={() => onUpdate({ ...property, items: undefined })}
            level={level + 1}
          />
        </div>
      )}

      <PropertyEditDialog
        property={property}
        open={isEditing}
        onOpenChange={setIsEditing}
        onUpdate={onUpdate}
      />

      {isAddingChild && newChild && (
        <PropertyEditDialog
          property={newChild}
          open={isAddingChild}
          onOpenChange={(open) => {
            if (!open) {
              if (newChild.key) {
                confirmAddChild(newChild);
              } else {
                cancelAddChild();
              }
            }
          }}
          onUpdate={setNewChild}
        />
      )}
    </div>
  );
}
