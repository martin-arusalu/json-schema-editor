# JSON Schema Builder

A beautiful, interactive React component for building and editing JSON schemas visually. Built with TypeScript, Tailwind CSS, and Radix UI.

- 📖 [View demo](https://martin-arusalu.github.io/json-schema-editor)

## Features

- 🎨 **Visual Editor** - Build JSON schemas with an intuitive drag-and-drop interface
- 📝 **Full JSON Schema Support** - Support for all JSON Schema types and constraints
- 🎯 **Type-Safe** - Written in TypeScript with full type definitions
- ✅ **Official JSON Schema Types** - Uses `@types/json-schema` for spec compliance
- 🎨 **Customizable** - Flexible API with extensive customization options
- 📦 **Headless Options** - Use just the hooks and utilities without UI
- 🌗 **Theme Support** - Built-in dark mode support
- ⚡ **Lightweight** - Tree-shakeable with minimal bundle size impact

## Installation

```bash
npm install json-schema-builder-react
# or
yarn add json-schema-builder-react
# or
pnpm add json-schema-builder-react
```

### Styling

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
    './node_modules/json-schema-editor/**/*.{js,jsx}',  // Add this line
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
import { JsonSchemaBuilder } from 'json-schema-builder-react';

function App() {
  const handleSchemaChange = (schema) => {
    console.log('Schema updated:', schema);
  };

  return (
    <JsonSchemaBuilder 
      onSchemaChange={handleSchemaChange}
    />
  );
}
```

### With Initial Schema

```tsx
import { JsonSchemaBuilder } from 'json-schema-builder-react';

const initialSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' }
  },
  required: ['name']
};

function App() {
  return (
    <JsonSchemaBuilder 
      initialSchema={initialSchema}
      onSchemaChange={(schema) => {
        // Save to backend, localStorage, etc.
        console.log(schema);
      }}
    />
  );
}
```

### Customized Layout

```tsx
import { JsonSchemaBuilder } from 'json-schema-builder-react';

function App() {
  return (
    <JsonSchemaBuilder
      showMetadata={true}
      showImport={false}
      showClear={true}
      showOutput={true}
      className="h-[600px]"
      typeLabels={{
        string: 'Text',
        boolean: 'Yes/No',
        object: 'Form',
        array: 'List',
      }}
    />
  );
}
```

## API Reference

### JsonSchemaBuilder Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialSchema` | `object` | `undefined` | Initial JSON schema to load |
| `onSchemaChange` | `(schema: any) => void` | `undefined` | Callback when schema changes |
| `showMetadata` | `boolean` | `true` | Show metadata fields (title, description, version) |
| `showImport` | `boolean` | `true` | Show import button |
| `showClear` | `boolean` | `true` | Show clear all button |
| `showOutput` | `boolean` | `true` | Show JSON output panel |
| `headerContent` | `ReactNode` | `undefined` | Custom header content |
| `className` | `string` | `"h-screen"` | Custom className for container |
| `typeLabels` | `TypeLabels` | Default labels | Custom labels for property types (e.g., `{ string: 'Text', boolean: 'Yes/No' }`) |
| `propertyLabel` | `{ singular: string, plural: string }` | `{ singular: 'property', plural: 'properties' }` | Custom labels for top-level properties (e.g., `{ singular: 'input', plural: 'inputs' }`) |

### Customizing Type Labels

You can customize how property types are displayed to your users:

```tsx
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
  return (
    <JsonSchemaBuilder 
      typeLabels={customLabels}
      onSchemaChange={(schema) => console.log(schema)}
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

## Headless Usage

Use just the hooks and utilities without the UI components:

```tsx
import { useSchemaBuilder, generateSchema } from 'json-schema-builder-react';

function MyCustomEditor() {
  const {
    properties,
    metadata,
    schema,
    addProperty,
    updateProperty,
    deleteProperty,
  } = useSchemaBuilder(true);

  return (
    <div>
      {/* Build your own custom UI */}
      <button onClick={() => {
        const newProp = addProperty();
        updateProperty(newProp.id, {
          ...newProp,
          key: 'myProperty',
          type: 'string'
        });
      }}>
        Add Property
      </button>
      
      <pre>{JSON.stringify(schema, null, 2)}</pre>
    </div>
  );
}
```

## Available Exports

### Components
- `JsonSchemaBuilder` - Main builder component
- `PropertyDocument` - Individual property card
- `PropertyEditDialog` - Property edit modal
- `JsonOutput` - JSON output display
- `SchemaMetadataComponent` - Schema metadata fields

### Hooks
- `useSchemaBuilder` - Main schema builder logic
- `usePropertyEditor` - Property editing logic

### Utilities
- `generateSchema` - Generate JSON schema from properties
- `parseSchema` - Parse JSON schema into properties
- `downloadJsonFile` - Download schema as JSON file
- `importJsonFile` - Import schema from file

### Types
- `PropertyData` - Internal UI representation of a JSON Schema property (extends JSON Schema fields)
- `PropertyType` - JSON Schema type names (from `@types/json-schema`)
- `SchemaMetadata` - Schema metadata structure
- `JSONSchema7` - Official JSON Schema Draft 7 type (from `@types/json-schema`)
- `JSONSchema7TypeName` - JSON Schema type names (from `@types/json-schema`)

**Note**: This library uses official JSON Schema types from `@types/json-schema` to ensure compatibility with the JSON Schema specification.

## Examples

### Using Individual Components

```tsx
import { 
  PropertyDocument, 
  useSchemaBuilder 
} from 'json-schema-builder-react';

function CustomEditor() {
  const { properties, updateProperty, deleteProperty } = useSchemaBuilder();

  return (
    <div>
      {properties.map(property => (
        <PropertyDocument
          key={property.id}
          property={property}
          onUpdate={(updated) => updateProperty(property.id, updated)}
          onDelete={() => deleteProperty(property.id)}
        />
      ))}
    </div>
  );
}
```

### Programmatic Schema Generation

```tsx
import { generateSchema } from 'json-schema-builder-react';
import type { PropertyData } from 'json-schema-builder-react';

const properties: PropertyData[] = [
  {
    id: '1',
    key: 'username',
    type: 'string',
    required: true,
    constraints: {
      minLength: 3,
      maxLength: 20
    }
  },
  {
    id: '2',
    key: 'email',
    type: 'string',
    required: true,
    constraints: {
      pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
    }
  }
];

const schema = generateSchema(
  properties,
  { title: 'User Schema', description: 'User registration', version: '1.0.0' },
  true
);
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
    './node_modules/json-schema-editor/**/*.{js,jsx}',
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
