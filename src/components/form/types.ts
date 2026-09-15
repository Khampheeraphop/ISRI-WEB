import type { FieldValues, Path } from "react-hook-form";
import type { Accept } from "react-dropzone";

export type FormOption = { label: string; value: string; disabled?: boolean };

export type FormField<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  type?: "text" | "number" | "date" | "textarea" | "select" | "file";
  options?: FormOption[] | ((values: T) => FormOption[]);
  placeholder?: string;
  description?: string;
  readOnly?: boolean;
  min?: number;
  max?: number;
  limitText?: number;
  maxFiles?: number;
  accept?: Accept;
  acceptedFileTypesLabel?: string;
  maxFileSize?: number;
  fullWidth?: boolean;
  required?: boolean;
  visibleWhen?: (values: T) => boolean;
};
