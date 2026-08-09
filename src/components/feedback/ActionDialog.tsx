import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  type DialogProps,
} from "@mui/material";
import { CloseOutlined } from "@mui/icons-material";
import type { ReactNode } from "react";

export interface ActionDialogProps extends Omit<
  DialogProps,
  "title" | "children"
> {
  title: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  onRequestClose?: () => void;
}

export function ActionDialog({
  title,
  icon,
  children,
  footer,
  onRequestClose,
  ...dialogProps
}: ActionDialogProps) {
  return (
    <Dialog {...dialogProps} onClose={onRequestClose} fullWidth>
      <DialogTitle sx={{ px: 3, py: 2.25 }}>
        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
          {icon}
          <Stack sx={{ flexGrow: 1 }}>{title}</Stack>
          {onRequestClose && (
            <IconButton
              aria-label="ปิดหน้าต่าง"
              edge="end"
              onClick={onRequestClose}
            >
              <CloseOutlined />
            </IconButton>
          )}
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ px: 3, py: 2.5 }}>{children}</DialogContent>
      {footer && (
        <>
          <Divider />
          <DialogActions sx={{ px: 3, py: 2 }}>{footer}</DialogActions>
        </>
      )}
    </Dialog>
  );
}
