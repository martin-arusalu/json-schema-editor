// Custom hook for managing property editing state

import { useState, useEffect } from "react";
import type { PropertyData } from "@/types/schema";
import { toSnakeCase } from "@/lib/string-utils";

export interface UsePropertyEditorReturn {
  isKeyManuallyEdited: boolean;
  handleTitleChange: (title: string) => void;
  handleTitleBlur: () => void;
  handleKeyChange: (key: string) => void;
  handleFieldChange: (field: keyof PropertyData, value: any) => void;
  handleConstraintChange: (field: string, value: any) => void;
}

export const usePropertyEditor = (
  property: PropertyData,
  onUpdate: (property: PropertyData) => void,
): UsePropertyEditorReturn => {
  const [isKeyManuallyEdited, setIsKeyManuallyEdited] = useState(false);

  // Track if the key has been manually edited
  useEffect(() => {
    if (property.key && property.title) {
      const autoKey = toSnakeCase(property.title);
      if (property.key !== autoKey) {
        setIsKeyManuallyEdited(true);
      }
    }
  }, [property.key, property.title]);

  const handleFieldChange = (field: keyof PropertyData, value: any) => {
    onUpdate({ ...property, [field]: value });
  };

  const handleTitleChange = (title: string) => {
    handleFieldChange("title", title);
  };

  const handleTitleBlur = () => {
    // Auto-generate key from title on blur if it hasn't been manually edited
    if (!isKeyManuallyEdited && property.title) {
      const autoKey = toSnakeCase(property.title);
      handleFieldChange("key", autoKey);
    }
  };

  const handleKeyChange = (key: string) => {
    setIsKeyManuallyEdited(true);
    handleFieldChange("key", key);
  };

  const handleConstraintChange = (field: string, value: any) => {
    onUpdate({
      ...property,
      constraints: { ...property.constraints, [field]: value },
    });
  };

  return {
    isKeyManuallyEdited,
    handleTitleChange,
    handleTitleBlur,
    handleKeyChange,
    handleFieldChange,
    handleConstraintChange,
  };
};
