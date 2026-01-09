import { useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { JsonSchemaBuilder } from "@/components/JsonSchemaBuilder";
import NotFound from "@/pages/not-found";
import packageJson from "../package.json";

function SchemaBuilderPage() {
  const [schema, setSchema] = useState({
    type: "object",
    title: "User Profile Schema",
    description: "A comprehensive example schema showcasing all features",
    version: "1.0.0",
    properties: {
      userId: {
        type: "integer",
        title: "User ID",
        description: "Unique identifier for the user",
        minimum: 1,
      },
      username: {
        type: "string",
        title: "Username",
        minLength: 3,
        maxLength: 20,
        pattern: "^[a-zA-Z0-9_]+$",
      },
      email: {
        type: "string",
        title: "Email Address",
        format: "email",
        pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
      },
      role: {
        type: "string",
        title: "User Role",
        enum: ["admin", "editor", "viewer"],
        description: "Access level of the user",
      },
      isActive: {
        type: "boolean",
        title: "Is Active",
        description: "Whether the user account is currently active",
      },
      tags: {
        type: "array",
        title: "Interest Tags",
        items: {
          type: "string",
        },
        maxItems: 5,
        uniqueItems: true,
      },
      settings: {
        type: "object",
        title: "User Settings",
        properties: {
          notifications: {
            type: "boolean",
            title: "Enable Notifications",
          },
          theme: {
            type: "string",
            title: "Theme Preference",
            enum: ["light", "dark", "system"],
          },
        },
        required: ["theme"],
      },
    },
    required: ["userId", "username", "email", "role"],
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
