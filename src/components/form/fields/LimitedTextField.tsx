import { Box, TextField, type TextFieldProps } from "@mui/material";
import { useState, type ChangeEvent } from "react";

export type LimitedTextFieldProps = TextFieldProps & {
  limitText?: number;
};

export function LimitedTextField({
  limitText = 200,
  helperText,
  onChange,
  value,
  defaultValue,
  slotProps,
  ...props
}: LimitedTextFieldProps) {
  const [uncontrolledLength, setUncontrolledLength] = useState(() =>
    typeof defaultValue === "string" ? defaultValue.length : 0,
  );
  const textLength =
    typeof value === "string" ? value.length : uncontrolledLength;
  const htmlInputSlotProps =
    typeof slotProps?.htmlInput === "object" ? slotProps.htmlInput : {};

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUncontrolledLength(event.target.value.length);
    onChange?.(event);
  };

  return (
    <TextField
      {...props}
      value={value}
      defaultValue={defaultValue}
      onChange={handleChange}
      multiline
      helperText={
        <Box
          component="span"
          sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}
        >
          <Box component="span">{helperText}</Box>
          <Box component="span" sx={{ ml: "auto", whiteSpace: "nowrap" }}>
            {textLength}/{limitText}
          </Box>
        </Box>
      }
      slotProps={{
        ...slotProps,
        htmlInput: { ...htmlInputSlotProps, maxLength: limitText },
      }}
    />
  );
}
