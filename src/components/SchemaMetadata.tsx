import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SchemaMetadataProps {
  title: string;
  description: string;
  version: string;
  onUpdate: (field: string, value: string) => void;
}

export default function SchemaMetadata({
  title,
  description,
  version,
  onUpdate,
}: SchemaMetadataProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="p-4">
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between p-0 h-auto hover:bg-transparent"
        data-testid="button-toggle-metadata"
      >
        <h3 className="text-sm font-medium">Schema Metadata</h3>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </Button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="schema-title"
              className="text-xs text-muted-foreground"
            >
              Title
            </Label>
            <Input
              id="schema-title"
              placeholder="My Schema"
              value={title}
              onChange={(e) => onUpdate("title", e.target.value)}
              data-testid="input-title"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="schema-description"
              className="text-xs text-muted-foreground"
            >
              Description
            </Label>
            <Textarea
              id="schema-description"
              placeholder="Describe your schema..."
              value={description}
              onChange={(e) => onUpdate("description", e.target.value)}
              className="resize-none"
              rows={3}
              data-testid="input-schema-description"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="schema-version"
              className="text-xs text-muted-foreground"
            >
              Version
            </Label>
            <Input
              id="schema-version"
              placeholder="1.0.0"
              value={version}
              onChange={(e) => onUpdate("version", e.target.value)}
              data-testid="input-version"
            />
          </div>
        </div>
      )}
    </Card>
  );
}
