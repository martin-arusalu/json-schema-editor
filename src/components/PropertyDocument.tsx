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
  FileText,
} from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import PropertyEditDialog from "./PropertyEditDialog";
import type { PropertyData } from "@/types/schema";
import { useTypeLabels } from "@/contexts/TypeLabelsContext";
import { generatePropertyId } from "@/lib/id-generator";

interface PropertyDocumentProps {
  property: PropertyData;
  onUpdate: (property: PropertyData) => void;
  onDelete: () => void;
  level?: number;
  isArrayItem?: boolean;
  showRegex?: boolean;
}

export default function PropertyDocument({
  property,
  onUpdate,
  onDelete,
  level = 1,
  isArrayItem = false,
  showRegex = false,
}: PropertyDocumentProps) {
  const { getTypeLabel } = useTypeLabels();
  const [isEditing, setIsEditing] = useState(false);
  const [newChild, setNewChild] = useState<PropertyData | null>(null);
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(property.title || "");

  // Keep editedTitle in sync with property.title
  useEffect(() => {
    if (!isEditingTitle) {
      setEditedTitle(property.title || "");
    }
  }, [property.title, isEditingTitle]);

  const HeadingTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
  const canHaveChildren = property.type === "object";
  const hasChildren =
    canHaveChildren && property.children && property.children.length > 0;

  const headingClasses =
    {
      1: "text-xl",
      2: "text-base",
      3: "text-base",
      4: "text-base",
      5: "text-sm",
      6: "text-sm",
    }[level] || "text-sm";

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
      id: generatePropertyId(),
      key: "",
      type: "string",
      required: false,
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
    const trimmedTitle = editedTitle.trim();

    // Don't allow empty title - revert to original if empty
    if (!trimmedTitle) {
      setEditedTitle(property.title || "");
      setIsEditingTitle(false);
      return;
    }

    if (trimmedTitle !== property.title) {
      // Only update title, never change the key after creation
      onUpdate({ ...property, title: trimmedTitle });
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
              <div className="flex gap-2 flex-wrap">
                <div className="flex items-start gap-2">
                  <HeadingTag
                    className={`${headingClasses} font-medium cursor-pointer hover:text-primary transition-colors leading-none`}
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
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        {getTypeLabel(property.type)}
                        {property.type === "array" && property.items
                          ? ` of ${getTypeLabel(property.items.type)}`
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
                {property.description && (
                  <p
                    className="text-sm text-muted-foreground flex-1 min-w-[200px]"
                    data-testid={`text-description-${property.id}`}
                  >
                    {property.description}
                  </p>
                )}
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
              ? "ml-6 mt-1 border-l-2 border-border pl-6"
              : "ml-4 mt-1 border-l border-border pl-4"
          }
        >
          {property.children!.map((child) => (
            <PropertyDocument
              key={child.id}
              property={child}
              onUpdate={(updated) => updateChild(child.id, updated)}
              onDelete={() => deleteChild(child.id)}
              level={level + 1}
              showRegex={showRegex}
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
          />
        </div>
      )}

      <PropertyEditDialog
        property={property}
        open={isEditing}
        onOpenChange={setIsEditing}
        onUpdate={onUpdate}
        isArrayItem={isArrayItem}
        isNewProperty={false}
        showRegex={showRegex}
      />

      {isAddingChild && newChild && (
        <PropertyEditDialog
          property={newChild}
          open={isAddingChild}
          isNewProperty={true}
          onOpenChange={(open) => {
            if (!open) {
              cancelAddChild();
            }
          }}
          onUpdate={confirmAddChild}
          showRegex={showRegex}
        />
      )}
    </div>
  );
}
