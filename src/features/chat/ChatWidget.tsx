import {
  ChatBubbleOutlined,
  CloseOutlined,
  DeleteOutlined,
  SendOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Fab,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link } from "react-router-dom";
import type { User } from "../../types/user";
import { roleLabels } from "../../constants/roles";
import {
  getChatAvailability,
  isChatSourcePath,
  sendChat,
  type ChatMessage,
  type ChatReply,
} from "./chatApi";

const suggestions = {
  reporter: [
    "ฉันมีแต้มเท่าไหร่ แลกรางวัลอะไรได้บ้าง",
    "สรุปรายการแจ้งซ่อมของฉัน",
    "สะสมแต้มได้อย่างไร",
  ],
  dispatcher: [
    "มีงานรอจัดสรรกี่รายการ",
    "สรุปงานที่ฉันจัดสรร",
    "ขั้นตอนตรวจรับงานทำอย่างไร",
  ],
  technician: [
    "สรุปงานที่ฉันได้รับมอบหมาย",
    "ฉันมีแผน PM อะไรบ้าง",
    "การขออะไหล่ทำอย่างไร",
  ],
  admin: [
    "สรุปสถานะรายการแจ้งซ่อมทั้งหมด",
    "มีผู้ใช้รออนุมัติกี่คน",
    "ตรวจสต็อกของรางวัล",
  ],
};
const schema = yup.object({
  text: yup
    .string()
    .trim()
    .required("กรุณาพิมพ์คำถาม")
    .max(1500, "พิมพ์ได้ไม่เกิน 1,500 ตัวอักษร"),
});
type Entry = ChatMessage & Partial<Pick<ChatReply, "sources" | "fetchedAt">>;

function displaySources(sources: ChatReply["sources"] = []) {
  const allowed = sources.filter((source) => isChatSourcePath(source.path));
  const itemLinks = allowed.filter((source) => /\/[0-9a-f-]{36}$/i.test(source.path));
  return (itemLinks.length ? itemLinks : allowed).slice(0, 3);
}

export function ChatWidget({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const controller = useRef<AbortController | null>(null);
  const end = useRef<HTMLDivElement | null>(null);
  const submitting = useRef(false);
  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema), defaultValues: { text: "" } });
  const availability = useQuery({
    queryKey: ["chat-availability", user.id, user.role],
    queryFn: ({ signal }) => getChatAvailability(signal),
    enabled: open,
    staleTime: 60000,
    retry: false,
  });
  const mutation = useMutation({
    mutationFn: async (text: string) => {
      controller.current = new AbortController();
      const signal = AbortSignal.any([
        controller.current.signal,
        AbortSignal.timeout(70000),
      ]);
      const history = entries
        .slice(-6)
        .map(({ role, text: previous }) => ({ role, text: previous }));
      return sendChat([...history, { role: "user", text }], signal);
    },
    retry: false,
    onSuccess: (reply, text) => {
      setEntries(
        (previous) =>
          [
            ...previous,
            { role: "user", text },
            { role: "assistant", ...reply },
          ].slice(-60) as Entry[],
      );
      reset({ text: "" });
      setTimeout(() => setFocus("text"), 0);
    },
    onSettled: () => {
      submitting.current = false;
    },
  });
  useEffect(
    () => () => {
      controller.current?.abort();
    },
    [],
  );
  useEffect(() => {
    if (open) end.current?.scrollIntoView({ block: "end" });
  }, [entries, open, mutation.isPending, mutation.isError]);
  const send = ({ text }: { text: string }) => {
    if (submitting.current || !availability.data?.enabled) return;
    submitting.current = true;
    mutation.mutate(text.trim());
  };
  return (
    <>
      <Fab
        color="primary"
        aria-label="เปิดแชทผู้ช่วย ISRI"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        sx={{
          position: "fixed",
          right: { xs: 16, sm: 24 },
          bottom: "max(20px, env(safe-area-inset-bottom))",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          gap: 1,
          boxShadow: 2,
        }}
      >
        <ChatBubbleOutlined />
      </Fab>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="isri-chat-title"
        maxWidth={false}
        slotProps={{
          paper: {
            sx: {
              position: "fixed",
              right: { xs: 8, sm: 24 },
              bottom: { xs: 8, sm: 88 },
              m: 0,
              width: { xs: "calc(100% - 16px)", sm: 480 },
              maxWidth: "none",
              height: { xs: "calc(100dvh - 24px)", sm: 600 },
              maxHeight: {
                xs: "calc(100dvh - 24px)",
                sm: "calc(100dvh - 110px)",
              },
              borderRadius: 2,
              border: 1,
              borderColor: "divider",
              boxShadow: 3,
            },
          },
          transition: { onEntered: () => setFocus("text") },
        }}
      >
        <DialogTitle component="div" sx={{ px: 2, py: 1.5 }}>
          <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
            <ChatBubbleOutlined color="primary" />
            <Box sx={{ flex: 1 }}>
              <Typography id="isri-chat-title" sx={{ fontWeight: 700 }}>
                ผู้ช่วย ISRI
              </Typography>
              <Typography variant="caption" color="text.secondary">
                สำหรับ{roleLabels[user.role]} · ตอบจากข้อมูลในระบบ
              </Typography>
            </Box>
            <IconButton
              aria-label="เริ่มบทสนทนาใหม่"
              disabled={!entries.length || mutation.isPending}
              onClick={() => {
                setEntries([]);
                mutation.reset();
                reset({ text: "" });
              }}
            >
              <DeleteOutlined fontSize="small" />
            </IconButton>
            <IconButton aria-label="ปิดแชท" onClick={() => setOpen(false)}>
              <CloseOutlined />
            </IconButton>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent
          sx={{
            px: { xs: 1.5, sm: 2.25 },
            py: 2,
            bgcolor: "background.default",
            overflowWrap: "anywhere",
          }}
        >
          {!entries.length && (
            <Stack spacing={1.5} sx={{ py: 1 }}>
              <Typography sx={{ fontWeight: 700 }}>
                วันนี้ให้ช่วยดูเรื่องอะไรครับ?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ถามข้อมูล สรุปความคืบหน้า หรือวิธีใช้งาน ISRI ได้เลยครับ
              </Typography>
              <Stack sx={{ alignItems: "flex-start" }} spacing={1}>
                {suggestions[user.role].map((text) => (
                  <Chip
                    key={text}
                    label={text}
                    variant="outlined"
                    disabled={!availability.data?.enabled || mutation.isPending}
                    onClick={() => {
                      reset({ text });
                      send({ text });
                    }}
                    sx={{
                      height: "auto",
                      "& .MuiChip-label": { whiteSpace: "normal", py: 1 },
                    }}
                  />
                ))}
              </Stack>
              <Typography variant="caption" color="text.secondary">
                บทสนทนาจะหายเมื่อโหลดหน้าใหม่หรือออกจากระบบ
                กรุณาไม่ใส่ข้อมูลผู้ป่วยในแชท
              </Typography>
            </Stack>
          )}
          {availability.isPending && (
            <Typography role="status" variant="body2">
              กำลังเชื่อมต่อผู้ช่วย…
            </Typography>
          )}
          {(availability.isError || availability.data?.enabled === false) && (
            <Alert
              severity="info"
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => void availability.refetch()}
                >
                  ลองใหม่
                </Button>
              }
            >
              ผู้ช่วย AI ยังไม่พร้อมใช้งาน กรุณาติดต่อผู้ดูแลระบบ
            </Alert>
          )}
          <Box
            role="log"
            aria-label="บทสนทนากับผู้ช่วย ISRI"
            aria-live="polite"
            aria-relevant="additions text"
          >
            {entries.map((entry, index) => (
              <Box
                key={index}
                sx={{
                  my: 1.75,
                  ml: entry.role === "user" ? { xs: 3, sm: 7 } : 0,
                  px: entry.role === "assistant" ? { xs: 1.75, sm: 2 } : 1.75,
                  py: 1.5,
                  borderRadius: 2.5,
                  bgcolor:
                    entry.role === "user" ? "primary.main" : "background.paper",
                  color:
                    entry.role === "user"
                      ? "primary.contrastText"
                      : "text.primary",
                  border: entry.role === "assistant" ? 1 : 0,
                  borderColor: "divider",
                }}
              >
                <Typography
                  variant="caption"
                  component="div"
                  sx={{ mb: 0.75, fontWeight: 700, fontSize: "0.78rem" }}
                >
                  {entry.role === "user" ? "คุณ" : "ผู้ช่วย ISRI"}
                </Typography>
                <Typography
                  sx={{
                    whiteSpace: "pre-wrap",
                    fontSize: { xs: "0.94rem", sm: "0.96rem" },
                    lineHeight: 1.8,
                    letterSpacing: "0.005em",
                  }}
                >
                  {entry.text}
                </Typography>
                {!!entry.sources?.length && (
                  <Stack spacing={0.75} sx={{ mt: 1.5 }}>
                    {displaySources(entry.sources).map((source) => (
                        <Button
                          key={source.path}
                          component={Link}
                          to={source.path}
                          onClick={() => setOpen(false)}
                          size="small"
                          variant="outlined"
                          sx={{
                            justifyContent: "flex-start",
                            textAlign: "left",
                            py: 0.75,
                            lineHeight: 1.4,
                          }}
                        >
                          {source.label}
                        </Button>
                      ))}
                  </Stack>
                )}
                {entry.fetchedAt && (
                  <Typography
                    component="div"
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    ตรวจข้อมูลเมื่อ{" "}
                    {new Date(entry.fetchedAt).toLocaleString("th-TH", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </Typography>
                )}
              </Box>
            ))}
            {mutation.isPending && (
              <>
                <Box
                  sx={{
                    ml: 4,
                    p: 1.5,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    borderRadius: 2,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  <Typography variant="body2">{mutation.variables}</Typography>
                </Box>
                <Stack
                  role="status"
                  direction="row"
                  spacing={1}
                  sx={{ py: 2, alignItems: "center" }}
                >
                  <CircularProgress size={16} />
                  <Typography variant="body2">
                    กำลังตรวจข้อมูลและเรียบเรียงคำตอบ…
                  </Typography>
                </Stack>
              </>
            )}
          </Box>
          {mutation.isError && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {mutation.error.name === "TimeoutError"
                ? "หมดเวลารอคำตอบ กรุณาลองส่งใหม่"
                : mutation.error.message}{" "}
              ข้อความของคุณยังอยู่ในช่องพิมพ์
            </Alert>
          )}
          <div ref={end} />
        </DialogContent>
        <Divider />
        <Box
          component="form"
          onSubmit={handleSubmit(send)}
          sx={{ p: 1.5, pb: "max(12px, env(safe-area-inset-bottom))" }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "flex-end" }}>
            <TextField
              {...register("text")}
              label="ถามเกี่ยวกับ ISRI"
              fullWidth
              multiline
              maxRows={4}
              size="small"
              disabled={mutation.isPending || !availability.data?.enabled}
              error={Boolean(errors.text)}
              helperText={errors.text?.message}
              slotProps={{ htmlInput: { maxLength: 1500 } }}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  void handleSubmit(send)();
                }
              }}
            />
            <IconButton
              type="submit"
              color="primary"
              aria-label="ส่งข้อความ"
              disabled={mutation.isPending || !availability.data?.enabled}
            >
              <SendOutlined />
            </IconButton>
          </Stack>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 0.75 }}
          >
            AI อาจสรุปคลาดเคลื่อน ตรวจสอบรายละเอียดจากลิงก์ในคำตอบ
          </Typography>
        </Box>
      </Dialog>
    </>
  );
}
