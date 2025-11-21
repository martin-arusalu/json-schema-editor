import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isLibraryBuild = process.env.BUILD_MODE === "library";

export default defineConfig({
  base: process.env.NODE_ENV === "production" && !isLibraryBuild 
    ? "/json-schema-editor/" 
    : "/",
  publicDir: isLibraryBuild ? false : "public",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  build: isLibraryBuild
    ? {
        // Library build configuration
        lib: {
          entry: path.resolve(__dirname, "src/index.ts"),
          name: "JsonSchemaBuilder",
          formats: ["es", "cjs"],
          fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`,
        },
        rollupOptions: {
          // Externalize deps that shouldn't be bundled into the library
          external: [
            "react",
            "react-dom",
            "react/jsx-runtime",
            "lucide-react",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-dialog",
            "@radix-ui/react-label",
            "@radix-ui/react-select",
            "@radix-ui/react-slot",
            "@radix-ui/react-tooltip",
            "class-variance-authority",
            "clsx",
            "tailwind-merge",
          ],
          output: {
            // Provide global variables for UMD build
            globals: {
              react: "React",
              "react-dom": "ReactDOM",
              "react/jsx-runtime": "jsxRuntime",
            },
          },
        },
        outDir: path.resolve(__dirname, "dist-lib"),
        emptyOutDir: true,
        sourcemap: false, // Don't include source maps in published package
        // Generate TypeScript declarations
        cssCodeSplit: true,
      }
    : {
        // App build configuration (for demo site)
        outDir: path.resolve(__dirname, "dist"),
        emptyOutDir: true,
        sourcemap: true, // Include source maps for demo app debugging
      },
  server: {
    port: 5173,
    open: true,
  },
});
