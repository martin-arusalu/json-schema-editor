# JSON Schema Builder

A beautiful, interactive React component for building and editing JSON schemas visually. Built with TypeScript, Tailwind CSS, and Radix UI.

- 📖 [View demo](https://martin-arusalu.github.io/json-schema-editor)

## Features

- 🎨 **Visual Editor** - Build JSON schemas with an intuitive interface
- 📝 **Full JSON Schema Support** - Support for all JSON Schema types and constraints
- 🎯 **Type-Safe** - Written in TypeScript with full type definitions
- ✅ **Controlled Component** - Full control over state management
- 🎨 **Customizable** - Flexible API with extensive customization options
- 🌗 **Theme Support** - Built-in dark mode support
- ⚡ **Lightweight** - Minimal bundle size with focused API

## Installation

```bash
npm install json-schema-builder-react
# or
yarn add json-schema-builder-react
# or
pnpm add json-schema-builder-react
```

## Prerequisites

This library requires the following peer dependencies to be installed in your project:

### 1. Install shadcn/ui Components

This library uses [shadcn/ui](https://ui.shadcn.com/) components. You'll need to set up shadcn/ui and install the required components:

```bash
# Initialize shadcn/ui (if not already done)
npx shadcn@latest init

# Install required components
npx shadcn@latest add button dialog input select checkbox tooltip card label textarea
```

### 2. Install Radix UI and Utility Libraries

```bash
npm install @radix-ui/react-checkbox @radix-ui/react-dialog @radix-ui/react-label @radix-ui/react-select @radix-ui/react-slot @radix-ui/react-tooltip lucide-react class-variance-authority clsx tailwind-merge
```

### 3. Tailwind CSS Setup

This library uses Tailwind CSS utility classes. You'll need Tailwind CSS configured in your project.

#### 1. Install Tailwind CSS (if not already installed)

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### 2. Configure Tailwind Content Paths

Add the library to your `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/json-schema-builder-react/**/*.{js,jsx}',  // Add this line
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

#### 3. Configure PostCSS

Create or update `postcss.config.js` in your project root:

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

#### 4. Import Tailwind in your CSS

Add to your main CSS file (e.g., `src/index.css`):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Note:** The library components will automatically use your project's Tailwind theme (colors, spacing, etc.).

## Usage

### Basic Example

```tsx
import { useState } from 'react';
import { JsonSchemaBuilder } from 'json-schema-builder-react';

function App() {
  const [schema, setSchema] = useState({
    type: 'object',
    properties: {},
    required: []
  });

  return (
    <JsonSchemaBuilder 
      schema={schema}
      onChange={setSchema}
    />
  );
}
```

### With Initial Schema

```tsx
import { useState } from 'react';
import { JsonSchemaBuilder } from 'json-schema-builder-react';

function App() {
  const [schema, setSchema] = useState({
    type: 'object',
    title: 'User Profile',
    properties: {
      name: { 
        type: 'string',
        minLength: 2,
        maxLength: 50
      },
      age: { 
        type: 'integer',
        minimum: 0,
        maximum: 120
      }
    },
    required: ['name']
  });

  return (
    <JsonSchemaBuilder 
      schema={schema}
      onChange={(newSchema) => {
        setSchema(newSchema);
        // Save to backend, localStorage, etc.
        localStorage.setItem('schema', JSON.stringify(newSchema));
      }}
    />
  );
}
```

### Customized Layout

```tsx
import { useState } from 'react';
import { JsonSchemaBuilder } from 'json-schema-builder-react';

function App() {
  const [schema, setSchema] = useState({
    type: 'object',
    properties: {},
    required: []
  });

  return (
    <JsonSchemaBuilder
      schema={schema}
      onChange={setSchema}
      showMetadata={true}
      showOutput={true}
      className="h-[600px]"
      typeLabels={{
        string: 'Text',
        boolean: 'Yes/No',
        object: 'Form',
        array: 'List',
      }}
      propertyLabel={{
        singular: 'field',
        plural: 'fields'
      }}
    />
  );
}
```

### With Undo/Redo

Since the component is fully controlled, you can implement undo/redo easily:

```tsx
import { useState } from 'react';
import { JsonSchemaBuilder } from 'json-schema-builder-react';

function App() {
  const [history, setHistory] = useState([{
    type: 'object',
    properties: {},
    required: []
  }]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentSchema = history[currentIndex];

  const handleChange = (newSchema) => {
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(newSchema);
    setHistory(newHistory);
    setCurrentIndex(currentIndex + 1);
  };

  const undo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const redo = () => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div>
      <div className="toolbar">
        <button onClick={undo} disabled={currentIndex === 0}>
          Undo
        </button>
        <button onClick={redo} disabled={currentIndex === history.length - 1}>
          Redo
        </button>
      </div>
      
      <JsonSchemaBuilder
        schema={currentSchema}
        onChange={handleChange}
      />
    </div>
  );
}
```

### Editable Property Keys (Advanced)

By default, property keys are **immutable after creation** to prevent breaking existing references in your codebase. However, you can enable key editing with the `keyEditable` prop:

```tsx
import { useState } from 'react';
import { JsonSchemaBuilder } from 'json-schema-builder-react';

function App() {
  const [schema, setSchema] = useState({
    type: 'object',
    properties: {
      user_name: {
        type: 'string',
        title: 'User Name'
      }
    },
    required: []
  });

  return (
    <JsonSchemaBuilder
      schema={schema}
      onChange={setSchema}
      keyEditable={true} // ⚠️ Allows changing keys after creation
    />
  );
}
```

**⚠️ Warning:** Enabling `keyEditable` allows users to change property keys even after they've been created. This can break existing code that references these keys. Use with caution, primarily in development environments or when you have proper migration strategies in place.

### Standalone Property Editor

If you only need to edit a single property without the full builder UI, you can use the `PropertyEditDialog` component:

```tsx
import { useState } from 'react';
import { PropertyEditDialog } from 'json-schema-builder-react';
import type { PropertyData } from 'json-schema-builder-react';

function PropertyEditor() {
  const [isOpen, setIsOpen] = useState(false);
  const [property, setProperty] = useState<PropertyData>({
    id: '1',
    key: 'username',
    title: 'Username',
    type: 'string',
    required: true,
    minLength: 3,
    maxLength: 50,
  });

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Edit Property
      </button>
      
      <PropertyEditDialog
        property={property}
        open={isOpen}
        onOpenChange={setIsOpen}
        onSave={(updated) => {
          setProperty(updated);
          // Save to your backend or state management
          console.log('Updated property:', updated);
        }}
        isNewProperty={false}
        showRegex={true}
        typeLabels={{
          string: 'Text',
          number: 'Number',
          boolean: 'Yes/No'
        }}
      />
    </>
  );
}
```

## API Reference

### JsonSchemaBuilder Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `schema` | `object` | **Required** | The JSON schema object (controlled) |
| `onChange` | `(schema: any) => void` | **Required** | Callback when schema changes |
| `showMetadata` | `boolean` | `false` | Show metadata fields (title, description, version) |
| `showImport` | `boolean` | `true` | Show import button |
| `showClear` | `boolean` | `true` | Show clear all button |
| `showOutput` | `boolean` | `true` | Show JSON output panel |
| `showHeader` | `boolean` | `true` | Show header with action buttons |
| `showSummary` | `boolean` | `false` | Show summary at bottom |
| `showRegex` | `boolean` | `false` | Show regex pattern field for strings |
| `keyEditable` | `boolean` | `false` | Allow editing property keys after initialization (⚠️ may break references) |
| `className` | `string` | `"h-screen"` | Custom className for container |
| `typeLabels` | `TypeLabels` | Default labels | Custom labels for property types |
| `propertyLabel` | `{ singular: string, plural: string }` | `{ singular: 'property', plural: 'properties' }` | Custom labels for properties |

### PropertyEditDialog Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `property` | `PropertyData` | **Required** | The property object to edit |
| `open` | `boolean` | **Required** | Whether the dialog is open |
| `onOpenChange` | `(open: boolean) => void` | **Required** | Callback when dialog open state changes |
| `onSave` | `(property: PropertyData) => void` | **Required** | Callback when property is saved |
| `isArrayItem` | `boolean` | `false` | Whether this property is an array item |
| `isNewProperty` | `boolean` | `false` | Whether this is a new property (affects key editing) |
| `propertyLabel` | `{ singular: string, plural: string }` | `{ singular: 'Property', plural: 'Properties' }` | Custom labels |
| `showRegex` | `boolean` | `false` | Show regex pattern field for strings |
| `keyEditable` | `boolean` | `false` | Allow editing property key |
| `typeLabels` | `TypeLabels` | Default labels | Custom labels for property types |

### Customizing Type Labels

You can customize how property types are displayed to your users:

```tsx
import { useState } from 'react';
import { JsonSchemaBuilder } from 'json-schema-builder-react';
import type { TypeLabels } from 'json-schema-builder-react';

const customLabels: TypeLabels = {
  string: 'Text',
  number: 'Number',
  integer: 'Whole Number',
  boolean: 'Yes/No',
  object: 'Form',
  array: 'List',
  null: 'Empty'
};

function App() {
  const [schema, setSchema] = useState({
    type: 'object',
    properties: {},
    required: []
  });

  return (
    <JsonSchemaBuilder 
      schema={schema}
      onChange={setSchema}
      typeLabels={customLabels}
    />
  );
}
```

This affects:
- The type dropdown in the property editor
- Type labels shown in property cards
- Tooltips displaying type information

**Available types to customize:**
- `string` - Default: "String"
- `number` - Default: "Number"
- `integer` - Default: "Integer"
- `boolean` - Default: "Boolean"
- `object` - Default: "Object"
- `array` - Default: "Array"
- `null` - Default: "Null"

## Available Exports

### Components
- `JsonSchemaBuilder` – Main controlled JSON schema builder component
- `PropertyEditDialog` – Standalone dialog for editing a single schema property

### Types
- `JsonSchemaBuilderProps` – Props for the main builder component
- `PropertyData` – Type definition for a schema property
- `TypeLabels` – Type for customizing property type labels


## Advanced Usage

### Integration with State Management

The controlled component pattern makes it easy to integrate with any state management solution:

#### Redux
```tsx
import { useSelector, useDispatch } from 'react-redux';
import { JsonSchemaBuilder } from 'json-schema-builder-react';
import { updateSchema } from './schemaSlice';

function App() {
  const schema = useSelector(state => state.schema);
  const dispatch = useDispatch();

  return (
    <JsonSchemaBuilder
      schema={schema}
      onChange={(newSchema) => dispatch(updateSchema(newSchema))}
    />
  );
}
```

#### Zustand
```tsx
import { useSchemaStore } from './store';
import { JsonSchemaBuilder } from 'json-schema-builder-react';

function App() {
  const { schema, setSchema } = useSchemaStore();

  return (
    <JsonSchemaBuilder
      schema={schema}
      onChange={setSchema}
    />
  );
}
```

## Development

```bash
# Install dependencies
npm install

# Run demo app in development mode
npm run dev

# Build the library
npm run build:lib

# Build the demo app
npm run build

# Deploy demo to GitHub Pages
npm run deploy
```

## Troubleshooting

### PostCSS Warning

If you see this warning:
```
A PostCSS plugin did not pass the `from` option to `postcss.parse`
```

**Solution:** Make sure you have a `postcss.config.js` file in your project root:

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

And verify your `tailwind.config.js` includes the library path:

```js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/json-schema-builder-react/**/*.{js,jsx}',
  ],
  // ...
};
```

### Styles Not Appearing

Make sure you:
1. Have Tailwind CSS installed and configured
2. Added the library to your Tailwind content paths (see Styling section)
3. Imported Tailwind CSS in your main CSS file

## License

MIT © Martin Arusalu

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

- 🐛 [Report a bug](https://github.com/martin-arusalu/json-schema-editor/issues)
- 💡 [Request a feature](https://github.com/martin-arusalu/json-schema-editor/issues)
- 📖 [View demo](https://martin-arusalu.github.io/json-schema-editor)
