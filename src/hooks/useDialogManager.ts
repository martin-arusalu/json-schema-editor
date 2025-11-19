import { useState } from "react";

export interface UseDialogManagerReturn<T> {
  /**
   * Whether the dialog is currently open
   */
  isOpen: boolean;

  /**
   * The data associated with the dialog (e.g., the item being edited/created)
   */
  data: T | null;

  /**
   * Open the dialog with optional data
   */
  open: (data?: T) => void;

  /**
   * Close the dialog without saving
   */
  close: () => void;

  /**
   * Confirm and close the dialog (typically calls the onConfirm callback)
   */
  confirm: (data: T) => void;

  /**
   * Set the dialog open state directly
   */
  setIsOpen: (isOpen: boolean) => void;
}

export interface UseDialogManagerOptions<T> {
  /**
   * Callback when dialog is confirmed/saved
   */
  onConfirm?: (data: T) => void;

  /**
   * Callback when dialog is cancelled/closed without saving
   */
  onCancel?: () => void;

  /**
   * Factory function to create initial data when opening dialog
   */
  createInitialData?: () => T;
}

/**
 * Generic hook for managing dialog state with associated data.
 * Useful for dialogs that create/edit items with temporary state.
 *
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * // For adding a new property
 * const addDialog = useDialogManager<PropertyData>({
 *   createInitialData: () => ({
 *     id: generateId(),
 *     key: "",
 *     type: "string",
 *     required: false
 *   }),
 *   onConfirm: (property) => {
 *     updateProperty(property.id, property);
 *   }
 * });
 *
 * // Usage in JSX
 * <Button onClick={() => addDialog.open()}>Add Property</Button>
 *
 * {addDialog.isOpen && addDialog.data && (
 *   <PropertyEditDialog
 *     property={addDialog.data}
 *     open={addDialog.isOpen}
 *     onOpenChange={addDialog.setIsOpen}
 *     onSave={addDialog.confirm}
 *   />
 * )}
 * ```
 */
export function useDialogManager<T>(
  options: UseDialogManagerOptions<T> = {},
): UseDialogManagerReturn<T> {
  const { onConfirm, onCancel, createInitialData } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);

  const open = (initialData?: T) => {
    const dataToUse =
      initialData ?? (createInitialData ? createInitialData() : null);
    setData(dataToUse);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setData(null);
    onCancel?.();
  };

  const confirm = (confirmedData: T) => {
    onConfirm?.(confirmedData);
    setIsOpen(false);
    setData(null);
  };

  const handleSetIsOpen = (newIsOpen: boolean) => {
    if (!newIsOpen) {
      close();
    } else {
      setIsOpen(true);
    }
  };

  return {
    isOpen,
    data,
    open,
    close,
    confirm,
    setIsOpen: handleSetIsOpen,
  };
}
