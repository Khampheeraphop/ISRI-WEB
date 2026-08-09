import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { actionNeedsNote } from "./workOrderWorkflowUi";

type Props = {
  open: boolean;
  action: string | null;
  title: string;
  busy: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (note: string, files: File[]) => void;
};

export function WorkOrderActionDialog({
  open,
  action,
  title,
  busy,
  error,
  onClose,
  onSubmit,
}: Props) {
  const [note, setNote] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const requiresNote = Boolean(action && actionNeedsNote.has(action));
  const allowsFiles = action === "request_parts" || action === "submit_repair";
  useEffect(() => {
    if (open) {
      setNote("");
      setFiles([]);
    }
  }, [open]);
  return (
    <Dialog
      open={open}
      onClose={() => !busy && onClose()}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          <Typography color="text.secondary">
            บันทึกรายละเอียดไว้ในประวัติการดำเนินงาน
            เพื่อให้ผู้เกี่ยวข้องตรวจสอบย้อนหลังได้
          </Typography>
          <TextField
            label={requiresNote ? "รายละเอียด *" : "หมายเหตุ (ถ้ามี)"}
            required={requiresNote}
            multiline
            minRows={4}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          {allowsFiles && (
            <Button component="label" variant="outlined">
              แนบภาพประกอบ (ถ้ามี)
              <input
                hidden
                type="file"
                accept="image/jpeg,image/png"
                multiple
                onChange={(event) =>
                  setFiles(Array.from(event.target.files ?? []).slice(0, 3))
                }
              />
            </Button>
          )}
          {files.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              {files.map((file) => file.name).join(", ")}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={busy}>
          ยกเลิก
        </Button>
        <Button
          variant="contained"
          onClick={() => onSubmit(note, files)}
          disabled={busy || (requiresNote && note.trim().length < 5)}
        >
          {title}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
