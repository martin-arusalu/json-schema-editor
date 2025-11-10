import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { downloadJsonFile } from "@/lib/file-utils";

interface JsonOutputProps {
  schema: any;
  errors?: string[];
}

export default function JsonOutput({ schema, errors = [] }: JsonOutputProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const jsonString = JSON.stringify(schema, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "JSON schema has been copied successfully",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    downloadJsonFile(schema, "schema.json");
    toast({
      title: "Downloaded",
      description: "Schema saved as schema.json",
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-sm font-medium">JSON Schema Output</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            data-testid="button-copy"
          >
            {copied ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            data-testid="button-download"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Card className="m-4 bg-muted/30">
          <pre
            className="p-6 text-xs font-mono overflow-auto"
            data-testid="text-json-output"
          >
            <code>{jsonString}</code>
          </pre>
        </Card>
      </div>

      {errors.length > 0 && (
        <div className="border-t p-4 max-h-48 overflow-auto">
          <h3 className="text-sm font-medium mb-2 text-destructive">
            Validation Errors
          </h3>
          <div className="space-y-2">
            {errors.map((error, idx) => (
              <div
                key={idx}
                className="text-xs text-destructive flex gap-2"
                data-testid={`text-error-${idx}`}
              >
                <span>•</span>
                <span>{error}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {errors.length === 0 && (
        <div className="border-t p-4 flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span>Schema is valid</span>
        </div>
      )}
    </div>
  );
}
