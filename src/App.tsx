import { useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { JsonSchemaBuilder } from "@/components/JsonSchemaBuilder";
import NotFound from "@/pages/not-found";
import packageJson from "../package.json";

function SchemaBuilderPage() {
  const [schema, setSchema] = useState({
    type: "object",
  });

  return (
    <div className="h-screen flex flex-col">
      {/* Quick Instructions */}
      <div className="bg-muted/30 border-b px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-1 flex-1">
            <div>• Click title, type, or description to edit inline</div>
            <div>• Click asterisk to toggle required</div>
            <div>• Click edit icon for full editor</div>
            <div>• Click + on objects to nest fields</div>
            <div>• Import button to load JSON</div>
            <div>• Copy/download from output panel</div>
          </div>
          <div className="text-xs text-muted-foreground/60 shrink-0">
            v{packageJson.version}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <JsonSchemaBuilder
          schema={schema}
          onChange={(newSchema) => {
            setSchema(newSchema);
            console.log("Schema changed:", newSchema);
          }}
          propertyLabel={{ singular: "input", plural: "inputs" }}
          className="h-full"
          showMetadata
          keyEditable
        />
      </div>
    </div>
  );
}

function Router() {
  const base = import.meta.env.BASE_URL;

  return (
    <WouterRouter base={base}>
      <Switch>
        <Route path="/" component={SchemaBuilderPage} />
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Router />
    </TooltipProvider>
  );
}

export default App;
