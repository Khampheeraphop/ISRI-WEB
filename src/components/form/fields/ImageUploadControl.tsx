import { Controller, type Control, type FieldValues } from "react-hook-form";
import { ImageUploadField } from "./ImageUploadField";
import type { FormField } from "../types";

interface ImageUploadControlProps<T extends FieldValues> { control: Control<T>; field: FormField<T>; }

export function ImageUploadControl<T extends FieldValues>({ control, field }: ImageUploadControlProps<T>) {
  return <Controller control={control} name={field.name} render={({ field: controllerField, fieldState }) => <ImageUploadField label={field.label} required={field.required} files={controllerField.value ?? []} onChange={controllerField.onChange} errorMessage={fieldState.error?.message} />} />;
}
