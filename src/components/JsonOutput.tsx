import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { downloadJsonFile } from "@/lib/file-utils";

interface JsonOutputProps {
  schema: any;
}

export default function JsonOutput({ schema }: JsonOutputProps) {
  const [copied, setCopied] = useState(false);

  const jsonString = JSON.stringify(schema, null, 2);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadJsonFile(schema, "schema.json");
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
    </div>
  );
}
