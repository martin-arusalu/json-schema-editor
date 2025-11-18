// Custom hook for managing property editing state
import type { PropertyData } from "@/types/schema";
import { toSnakeCase } from "@/lib/string-utils";

export interface UsePropertyEditorReturn {
  handleTitleChange: (title: string) => void;
  handleTitleBlur: () => void;
  handleKeyChange: (key: string) => void;
  handleFieldChange: (field: keyof PropertyData, value: any) => void;
  handleConstraintChange: (field: string, value: any) => void;
}

export const usePropertyEditor = (
  property: PropertyData,
  onUpdate: (property: PropertyData) => void,
  isNewProperty: boolean = false,
): UsePropertyEditorReturn => {
  const handleFieldChange = (field: keyof PropertyData, value: any) => {
    onUpdate({ ...property, [field]: value });
  };

  const handleTitleChange = (title: string) => {
    handleFieldChange("title", title);
  };

  const handleTitleBlur = () => {
    // Auto-generate key from title on blur only for new properties
    // or if key hasn't been manually edited
    if (isNewProperty && property.title) {
      const autoKey = toSnakeCase(property.title);
      handleFieldChange("key", autoKey);
    }
  };

  const handleKeyChange = (key: string) => {
    // Only allow key changes for new properties
    if (isNewProperty) {
      handleFieldChange("key", key);
    }
  };

  const handleConstraintChange = (field: string, value: any) => {
    onUpdate({
      ...property,
      [field]: value,
    });
  };

  return {
    handleTitleChange,
    handleTitleBlur,
    handleKeyChange,
    handleFieldChange,
    handleConstraintChange,
  };
};
