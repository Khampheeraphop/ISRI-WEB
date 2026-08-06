import type { FieldValues, Path } from "react-hook-form";

export type FormOption = { label: string; value: string };

export type FormField<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  type?: "text" | "number" | "date" | "textarea" | "select" | "file";
  options?: FormOption[];
  placeholder?: string;
  readOnly?: boolean;
  fullWidth?: boolean;
  required?: boolean;
  visibleWhen?: (values: T) => boolean;
};
