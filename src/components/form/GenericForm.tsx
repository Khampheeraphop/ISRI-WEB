import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Button, Stack } from "@mui/material";
import { useEffect } from "react";
import {
  useForm,
  useWatch,
  type DefaultValues,
  type FieldValues,
  type Resolver,
  type SubmitErrorHandler,
  type SubmitHandler,
} from "react-hook-form";
import type { ObjectSchema } from "yup";
import { ImageUploadControl } from "./fields/ImageUploadControl";
import { SelectFieldControl } from "./fields/SelectFieldControl";
import { TextFieldControl } from "./fields/TextFieldControl";
import type { FormField } from "./types";

interface GenericFormProps<T extends FieldValues> {
  fields: FormField<T>[];
  schema: ObjectSchema<T>;
  defaultValues: DefaultValues<T>;
  submitLabel: string;
  onSubmit: SubmitHandler<T>;
  onInvalid?: SubmitErrorHandler<T>;
  onCancel?: () => void;
  cancelLabel?: string;
  isSubmitting?: boolean;
  columns?: 1 | 2;
}

export function GenericForm<T extends FieldValues>({
  fields,
  schema,
  defaultValues,
  submitLabel,
  onSubmit,
  onInvalid,
  onCancel,
  cancelLabel = "ยกเลิก",
  isSubmitting,
  columns = 1,
}: GenericFormProps<T>) {
  const { control, handleSubmit, setValue } = useForm<T>({
    defaultValues,
    resolver: yupResolver(schema) as unknown as Resolver<T>,
    mode: "onTouched",
    reValidateMode: "onChange",
  });
  
  const values = useWatch({ control }) as T;

  useEffect(() => {
    fields.forEach((field) => {
      if (field.type === "select" && typeof field.options === "function") {
        const resolvedOptions = field.options(values);
        const currentValue = values[field.name];
        if (currentValue && !resolvedOptions.some((opt) => opt.value === currentValue)) {
          setValue(field.name, "" as any, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
        }
      }
    });
  }, [values, fields, setValue]);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns:
          columns === 2
            ? { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }
            : "1fr",
      }}
      noValidate
    >
      {fields
        .filter((field) => !field.visibleWhen || field.visibleWhen(values))
        .map((field) => {
          const resolvedField = {
            ...field,
            options: typeof field.options === "function" ? field.options(values) : field.options,
          } as FormField<T>;

          return (
            <Box
              key={resolvedField.name}
              sx={{ gridColumn: resolvedField.fullWidth ? "1 / -1" : "auto" }}
            >
              {resolvedField.type === "select" ? (
                <SelectFieldControl control={control} field={resolvedField} />
              ) : resolvedField.type === "file" ? (
                <ImageUploadControl control={control} field={resolvedField} />
              ) : (
                <TextFieldControl control={control} field={resolvedField} />
              )}
            </Box>
          );
        })}
      <Stack
        direction="row"
        spacing={1.25}
        sx={{ gridColumn: "1 / -1", pt: 1, justifyContent: "flex-end" }}
      >
        {onCancel && (
          <Button
            type="button"
            variant="outlined"
            color="inherit"
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
        )}
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </Stack>
    </Box>
  );
}
