import { MenuItem, TextField, IconButton } from "@mui/material";
import { Clear as ClearIcon } from "@mui/icons-material";
import { Controller, type Control, type FieldValues } from "react-hook-form";
import type { FormField } from "../types";

interface SelectFieldControlProps<T extends FieldValues> {
  control: Control<T>;
  field: FormField<T>;
}

export function SelectFieldControl<T extends FieldValues>({
  control,
  field,
}: SelectFieldControlProps<T>) {
  return (
    <Controller
      control={control}
      name={field.name}
      render={({ field: controllerField, fieldState }) => (
        <TextField
          {...controllerField}
          select
          slotProps={{
            input: { readOnly: field.readOnly },
            formHelperText: { sx: { marginLeft: 0 } },
            select: {
              endAdornment: controllerField.value ? (
                <IconButton
                  size="small"
                  sx={{ position: "absolute", right: 28 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    controllerField.onChange("");
                    controllerField.onBlur();
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              ) : undefined,
            },
          }}
          label={field.label}
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
        >
          {(Array.isArray(field.options) ? field.options : [])?.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
}
