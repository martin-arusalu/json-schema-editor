import { Switch, Route, Router as WouterRouter } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { JsonSchemaBuilder } from "@/components/JsonSchemaBuilder";
import NotFound from "@/pages/not-found";

function SchemaBuilderPage() {
  return (
    <div className="h-screen flex flex-col">
      {/* Quick Instructions */}
      <div className="bg-muted/30 border-b px-6 py-3">
        <div className="text-xs text-muted-foreground grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-1">
          <div>• Click title to edit inline</div>
          <div>• Click circle to toggle required</div>
          <div>• Click edit icon for full editor</div>
          <div>• Click + on objects to nest fields</div>
          <div>• Import button to load JSON</div>
          <div>• Copy/download from output panel</div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <JsonSchemaBuilder
          initialSchema={{}}
          onSchemaChange={(schema) => {
            console.log("Schema changed:", schema);
          }}
          showMetadata={true}
          propertyLabel={{ singular: "input", plural: "inputs" }}
          className="h-full"
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
