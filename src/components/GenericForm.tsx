import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Button, MenuItem, TextField } from "@mui/material";
import {
  Controller,
  useForm,
  type DefaultValues,
  type FieldValues,
  type Path,
  type Resolver,
  type SubmitHandler,
} from "react-hook-form";
import type { ObjectSchema } from "yup";

type Option = { label: string; value: string };
export type FormField<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  type?: "text" | "select";
  options?: Option[];
  placeholder?: string;
};

interface GenericFormProps<T extends FieldValues> {
  fields: FormField<T>[];
  schema: ObjectSchema<T>;
  defaultValues: DefaultValues<T>;
  submitLabel: string;
  onSubmit: SubmitHandler<T>;
  isSubmitting?: boolean;
}

export function GenericForm<T extends FieldValues>({
  fields,
  schema,
  defaultValues,
  submitLabel,
  onSubmit,
  isSubmitting,
}: GenericFormProps<T>) {
  const { control, handleSubmit } = useForm<T>({
    defaultValues,
    resolver: yupResolver(schema) as unknown as Resolver<T>,
  });
  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: "grid", gap: 2 }}
      noValidate
    >
      {fields.map((field) => (
        <Controller
          key={field.name}
          control={control}
          name={field.name}
          render={({ field: controllerField, fieldState }) => (
            <TextField
              {...controllerField}
              select={field.type === "select"}
              label={field.label}
              placeholder={field.placeholder}
              error={Boolean(fieldState.error)}
              helperText={fieldState.error?.message}
              fullWidth
            >
              {field.type === "select" &&
                field.options?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
            </TextField>
          )}
        />
      ))}
      <Button type="submit" variant="contained" disabled={isSubmitting}>
        {submitLabel}
      </Button>
    </Box>
  );
}
