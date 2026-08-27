import { MenuItem, TextField } from "@mui/material";
import { Controller, type Control, type FieldValues } from "react-hook-form";
import type { FormField } from "../types";

interface SelectFieldControlProps<T extends FieldValues> { control: Control<T>; field: FormField<T>; }

export function SelectFieldControl<T extends FieldValues>({ control, field }: SelectFieldControlProps<T>) {
  return <Controller control={control} name={field.name} render={({ field: controllerField, fieldState }) => <TextField {...controllerField} select label={field.label} required={field.required} error={Boolean(fieldState.error)} helperText={fieldState.error?.message ?? field.description} fullWidth>{field.options?.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}</TextField>} />;
}
