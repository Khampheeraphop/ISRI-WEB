import { TextField } from "@mui/material";
import { Controller, type Control, type FieldValues } from "react-hook-form";
import type { FormField } from "../types";

interface TextFieldControlProps<T extends FieldValues> {
  control: Control<T>;
  field: FormField<T>;
}

export function TextFieldControl<T extends FieldValues>({
  control,
  field,
}: TextFieldControlProps<T>) {
  return (
    <Controller
      control={control}
      name={field.name}
      render={({ field: controllerField, fieldState }) => (
        <TextField
          {...controllerField}
          type={
            field.type === "number"
              ? "number"
              : field.type === "date"
                ? "date"
                : "text"
          }
          label={field.label}
          placeholder={field.placeholder}
          multiline={field.type === "textarea"}
          minRows={field.type === "textarea" ? 4 : undefined}
          required={field.required}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message ?? field.description}
          fullWidth
          slotProps={{
            input: { readOnly: field.readOnly },
            htmlInput: field.type === "number" ? { min: field.min ?? 1, max: field.max } : undefined,
          }}
        />
      )}
    />
  );
}
