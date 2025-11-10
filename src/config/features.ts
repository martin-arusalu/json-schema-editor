// Feature flags for the application
export const FEATURES = {
  // Enable schema metadata (title, description, version)
  ENABLE_METADATA: import.meta.env.VITE_ENABLE_METADATA == "true",
} as const;
