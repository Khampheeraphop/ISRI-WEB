import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { FileUploadField } from "../../components/form/fields/FileUploadField";
import { actionNeedsNote } from "./workOrderWorkflowUi";

const MAX_ATTACHMENTS = 3;
const MAX_ATTACHMENT_SIZE = 3 * 1024 * 1024;
const ATTACHMENT_ACCEPT = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
};

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
  const allowsFiles =
    action === "request_parts" ||
    action === "submit_repair" ||
    action === "return_for_rework";
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
            label={requiresNote ? "รายละเอียดการดำเนินงาน" : "หมายเหตุ (ถ้ามี)"}
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
            <FileUploadField
              label="แนบภาพประกอบ (ถ้ามี)"
              files={files}
              accept={ATTACHMENT_ACCEPT}
              acceptedFileTypesLabel="JPG, JPEG, PNG"
              maxFiles={MAX_ATTACHMENTS}
              maxSize={MAX_ATTACHMENT_SIZE}
              variant="button"
              showImagePreviews={false}
              onChange={setFiles}
            />
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
