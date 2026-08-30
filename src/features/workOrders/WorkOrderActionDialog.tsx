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
  const canSubmit = !busy && (!requiresNote || note.trim().length > 0);
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
          <TextField
            label={
              requiresNote ? "รายละเอียดการดำเนินงาน *" : "หมายเหตุ (ถ้ามี)"
            }
            required={requiresNote}
            multiline
            minRows={4}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={
              action === "submit_repair"
                ? "ระบุสิ่งที่ซ่อมและผลการทดสอบ"
                : action === "request_parts"
                  ? "ระบุรายการอะไหล่และเหตุผลที่ต้องใช้"
                  : action === "reject_parts"
                    ? "ระบุเหตุผลและรายการที่ต้องแก้ไขก่อนส่งคำขอใหม่"
                    : action === "return_for_rework"
                      ? "ระบุสิ่งที่ต้องแก้ไขหรือหลักฐานที่ต้องส่งเพิ่ม"
                      : undefined
            }
            error={requiresNote && note.length > 0 && note.trim().length === 0}
            helperText={
              requiresNote ? "กรอกรายละเอียดก่อนยืนยันการดำเนินการ" : ""
            }
            fullWidth
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
            <Stack spacing={0.25}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                แนบแล้ว {files.length} ภาพ
              </Typography>
              {files.map((file) => (
                <Typography
                  key={`${file.name}-${file.lastModified}`}
                  variant="body2"
                  color="text.secondary"
                >
                  {file.name}
                </Typography>
              ))}
            </Stack>
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
          disabled={!canSubmit}
        >
          {title}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
