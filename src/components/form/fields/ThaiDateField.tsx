import { CalendarMonthOutlined } from "@mui/icons-material";
import {
  Box,
  IconButton,
  InputAdornment,
  TextField,
  type SxProps,
  type Theme,
} from "@mui/material";
import { useRef, type ReactNode } from "react";
import { formatThaiDateInput } from "../../../utils/date";

interface ThaiDateFieldProps {
  name?: string;
  label: string;
  value?: string | null;
  onChange: (value: string) => void;
  onBlur?: () => void;
  required?: boolean;
  readOnly?: boolean;
  min?: string;
  error?: boolean;
  helperText?: ReactNode;
  fullWidth?: boolean;
  sx?: SxProps<Theme>;
}

export function ThaiDateField({
  name,
  label,
  value,
  onChange,
  onBlur,
  required,
  readOnly,
  min,
  error,
  helperText,
  fullWidth = true,
  sx,
}: ThaiDateFieldProps) {
  const pickerRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    if (readOnly) return;
    const picker = pickerRef.current;
    if (!picker) return;

    try {
      picker.showPicker();
    } catch {
      picker.click();
    }
  };

  return (
    <Box sx={{ position: "relative" }}>
      <TextField
        label={label}
        value={formatThaiDateInput(value)}
        required={required}
        error={error}
        helperText={helperText}
        fullWidth={fullWidth}
        onClick={openPicker}
        onBlur={onBlur}
        sx={sx}
        slotProps={{
          input: {
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label={`เลือก${label}`}
                  edge="end"
                  disabled={readOnly}
                  onClick={(event) => {
                    event.stopPropagation();
                    openPicker();
                  }}
                >
                  <CalendarMonthOutlined />
                </IconButton>
              </InputAdornment>
            ),
          },
          inputLabel: { shrink: true },
          formHelperText: { sx: { marginLeft: 0 } },
        }}
      />
      <input
        ref={pickerRef}
        name={name}
        type="date"
        value={value ?? ""}
        min={min}
        readOnly={readOnly}
        aria-label={label}
        tabIndex={-1}
        onChange={(event) => {
          onChange(event.target.value);
          onBlur?.();
        }}
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: "none",
          bottom: 0,
          right: 0,
        }}
      />
    </Box>
  );
}
