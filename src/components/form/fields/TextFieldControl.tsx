import { TextField } from "@mui/material";
import { Controller, type Control, type FieldValues } from "react-hook-form";
import type { FormField } from "../types";
import { LimitedTextField } from "./LimitedTextField";
import { ThaiDateField } from "./ThaiDateField";

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
      render={({ field: controllerField, fieldState }) =>
        field.type === "date" ? (
          <ThaiDateField
            name={controllerField.name}
            label={field.label}
            value={controllerField.value as string}
            onChange={controllerField.onChange}
            onBlur={controllerField.onBlur}
            required={field.required}
            readOnly={field.readOnly}
            error={Boolean(fieldState.error)}
            helperText={fieldState.error?.message ?? field.description}
            sx={
              field.readOnly
                ? {
                    "& .MuiInputBase-root": {
                      backgroundColor: "action.hover",
                    },
                    "& .MuiInputBase-input": {
                      color: "text.disabled",
                      WebkitTextFillColor: "var(--mui-palette-text-disabled)",
                    },
                    "& .MuiFormLabel-root": { color: "text.disabled" },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "action.disabled",
                    },
                  }
                : undefined
            }
          />
        ) : field.type === "textarea" ? (
          <LimitedTextField
            {...controllerField}
            limitText={field.limitText}
            label={field.label}
            placeholder={field.placeholder}
            minRows={4}
            required={field.required}
            error={Boolean(fieldState.error)}
            helperText={fieldState.error?.message ?? field.description}
            fullWidth
            sx={
              field.readOnly
                ? {
                    "& .MuiInputBase-root": {
                      backgroundColor: "action.hover",
                      pointerEvents: "none",
                    },
                    "& .MuiInputBase-input": {
                      color: "text.disabled",
                      WebkitTextFillColor: "var(--mui-palette-text-disabled)",
                    },
                    "& .MuiFormLabel-root": { color: "text.disabled" },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "action.disabled",
                    },
                  }
                : undefined
            }
            slotProps={{
              input: { readOnly: field.readOnly },
              formHelperText: { sx: { marginLeft: 0 } },
            }}
          />
        ) : (
          <TextField
            {...controllerField}
            type={field.type === "number" ? "number" : "text"}
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            error={Boolean(fieldState.error)}
            helperText={fieldState.error?.message ?? field.description}
            fullWidth
            sx={
              field.readOnly
                ? {
                    "& .MuiInputBase-root": {
                      backgroundColor: "action.hover",
                      pointerEvents: "none",
                    },
                    "& .MuiInputBase-input": {
                      color: "text.disabled",
                      WebkitTextFillColor: "var(--mui-palette-text-disabled)",
                    },
                    "& .MuiFormLabel-root": {
                      color: "text.disabled",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "action.disabled",
                    },
                    "& .MuiSvgIcon-root": {
                      color: "action.disabled",
                    },
                  }
                : undefined
            }
            slotProps={{
              input: { readOnly: field.readOnly },
              htmlInput:
                field.type === "number"
                  ? { min: field.min ?? 1, max: field.max }
                  : undefined,
              formHelperText: { sx: { marginLeft: 0 } },
            }}
          />
        )
      }
    />
  );
}
