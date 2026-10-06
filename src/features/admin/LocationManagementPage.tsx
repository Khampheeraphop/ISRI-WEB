import {
  AddOutlined,
  DeleteOutlineRounded,
  DownloadOutlined,
  EditOutlined,
  QrCode2Outlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import QRCode from "qrcode";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GenericDataTable } from "../../components/GenericDataTable";
import { MainCard } from "../../components/base/MainCard";
import { ActionDialog } from "../../components/feedback/ActionDialog";
import { tableColumnAlignment } from "../../components/dataTable.constants";
import type { ManagedLocation } from "../../types/location";
import { deleteManagedLocation, getManagedLocations } from "./locationsApi";

// A6 portrait at 300 DPI. The 720 px QR prints at about 61 mm, which is
// comfortably scannable when the label is mounted on a wall or equipment.
const QR_SIZE = 720;
const POSTER_WIDTH = 1240;
const POSTER_HEIGHT = 1580;

const getQrUrl = (location: ManagedLocation) => {
  const asset = location.assetName
    ? `&asset=${encodeURIComponent(location.assetName)}`
    : "";
  return `${window.location.origin}/incidents/new?loc=${encodeURIComponent(location.code)}${asset}`;
};

const getLocationTitle = (location: ManagedLocation) => {
  const base = `${location.building} · ${location.floor} · ${location.zone}`;
  return location.assetName ? `${base} · ${location.assetName}` : base;
};

const getDownloadFileName = (location: ManagedLocation) =>
  `QR-${getLocationTitle(location)}`
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120) + ".png";

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const roundedRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) => {
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + w, y, x + w, y + h, r);
  context.arcTo(x + w, y + h, x, y + h, r);
  context.arcTo(x, y + h, x, y, r);
  context.arcTo(x, y, x + w, y, r);
  context.closePath();
};

const drawWrappedText = (
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number => {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (context.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  lines.forEach((item, index) =>
    context.fillText(item, x, y + index * lineHeight),
  );
  return lines.length;
};

const getQrCodeImage = (location: ManagedLocation) =>
  QRCode.toDataURL(getQrUrl(location), {
    width: 768,
    margin: 2,
    color: { dark: "#18181B", light: "#FFFFFF" },
    errorCorrectionLevel: "M",
  });

const canvasToPngBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("ไม่สามารถสร้างไฟล์ PNG ได้"));
      }
    }, "image/png");
  });

const getQrPoster = async (location: ManagedLocation) => {
  const qrImage = await loadImage(await getQrCodeImage(location));
  const canvas = document.createElement("canvas");
  canvas.width = POSTER_WIDTH;
  canvas.height = POSTER_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("ไม่สามารถสร้างภาพ QR ได้");

  context.fillStyle = "#FFFEFA";
  context.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);
  context.strokeStyle = "#D8D4CB";
  context.lineWidth = 4;
  roundedRect(context, 30, 30, POSTER_WIDTH - 60, POSTER_HEIGHT - 60, 22);
  context.stroke();

  context.textAlign = "center";

  context.fillStyle = "#4B3B86";
  context.font = "600 25px Anuphan, sans-serif";
  context.fillText("จุดแจ้งเหตุ", POSTER_WIDTH / 2, 110);
  context.fillStyle = "#25232A";
  context.font = "700 34px Anuphan, sans-serif";
  drawWrappedText(
    context,
    getLocationTitle(location),
    POSTER_WIDTH / 2,
    166,
    POSTER_WIDTH - 220,
    42,
  );

  context.fillStyle = "#FFFFFF";
  context.strokeStyle = "#ECE8E1";
  context.lineWidth = 3;
  roundedRect(context, 170, 260, POSTER_WIDTH - 340, POSTER_WIDTH - 340, 16);
  context.fill();
  context.stroke();
  context.drawImage(qrImage, 260, 350, QR_SIZE, QR_SIZE);

  context.fillStyle = "#2A2830";
  context.font = "600 30px Anuphan, sans-serif";
  context.fillText(
    "สแกน QR เพื่อเปิดแบบฟอร์มแจ้งปัญหา",
    POSTER_WIDTH / 2,
    1275,
  );
  context.fillStyle = "#77717A";
  context.font = "500 25px Anuphan, sans-serif";
  context.fillText("ระบบจะระบุตำแหน่งให้โดยอัตโนมัติ", POSTER_WIDTH / 2, 1325);
  context.fillStyle = "#A7A1AA";
  context.font = "500 22px Anuphan, sans-serif";
  context.fillText(`รหัสจุด: ${location.code}`, POSTER_WIDTH / 2, 1415);
  return canvasToPngBlob(canvas);
};

const isAppleMobileDevice = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

const downloadQr = async (location: ManagedLocation) => {
  const blob = await getQrPoster(location);
  const fileName = getDownloadFileName(location);
  const file = new File([blob], fileName, { type: "image/png" });

  // On iOS, the native share sheet is substantially more reliable than a
  // synthetic download and includes Save Image / Save to Files.
  if (
    isAppleMobileDevice() &&
    typeof navigator.share === "function" &&
    navigator.canShare?.({ files: [file] })
  ) {
    try {
      await navigator.share({ files: [file], title: fileName });
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      // Fall through to the regular browser download when sharing is blocked.
    }
  }

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
};

export function LocationManagementPage() {
  const queryClient = useQueryClient();
  const locations = useQuery({
    queryKey: ["managed-locations"],
    queryFn: getManagedLocations,
  });
  const remove = useMutation({
    mutationFn: deleteManagedLocation,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["managed-locations"] });
      setDeleteTarget(undefined);
      setFeedback("ลบ QR Code เรียบร้อยแล้ว");
    },
  });
  const [preview, setPreview] = useState<{
    location: ManagedLocation;
    image: string;
  }>();
  const [downloadingLocationId, setDownloadingLocationId] = useState<string>();
  const [downloadError, setDownloadError] = useState<string>();
  const [deleteTarget, setDeleteTarget] = useState<ManagedLocation>();
  const [feedback, setFeedback] = useState<string>();

  const actionButtonSx = {
    width: 34,
    height: 34,
    border: "1px solid",
    borderColor: "divider",
    borderRadius: 2,
    color: "text.secondary",
    bgcolor: "background.paper",
    "&:hover": {
      borderColor: "primary.light",
      color: "primary.main",
      bgcolor: "action.hover",
    },
  } as const;

  const handleDownload = async (location: ManagedLocation) => {
    setDownloadError(undefined);
    setDownloadingLocationId(location.id);
    try {
      await downloadQr(location);
    } catch (error) {
      setDownloadError(
        error instanceof Error
          ? error.message
          : "ไม่สามารถดาวน์โหลด QR ได้ กรุณาลองใหม่อีกครั้ง",
      );
    } finally {
      setDownloadingLocationId(undefined);
    }
  };
  const columns: GridColDef<ManagedLocation>[] = [
    { field: "building", headerName: "อาคาร", width: 240 },
    { field: "floor", headerName: "ชั้น", width: 100 },
    { field: "zone", headerName: "โซน", width: 240 },
    { field: "assetName", headerName: "ชิ้นงาน", minWidth: 220, flex: 1 },
    {
      field: "actions",
      headerName: "จัดการ",
      width: 208,
      ...tableColumnAlignment.actions,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.75} sx={{ width: "100%", justifyContent: "center" }}>
          <Tooltip title="ดู QR" arrow>
            <IconButton
              aria-label="ดู QR"
              sx={actionButtonSx}
              onClick={async () =>
                setPreview({ location: row, image: await getQrCodeImage(row) })
              }
            >
              <VisibilityOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="ดาวน์โหลด QR" arrow>
            <span>
              <IconButton
                aria-label="ดาวน์โหลด QR"
                sx={actionButtonSx}
                disabled={downloadingLocationId === row.id}
                onClick={() => void handleDownload(row)}
              >
                {downloadingLocationId === row.id ? (
                  <CircularProgress size={18} />
                ) : (
                  <DownloadOutlined fontSize="small" />
                )}
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="แก้ไขตำแหน่ง" arrow>
            <IconButton
              component={Link}
              to={`/locations/${row.id}`}
              aria-label="แก้ไขตำแหน่ง"
              sx={actionButtonSx}
            >
              <EditOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="ลบ QR" arrow>
            <IconButton
              aria-label="ลบ QR"
              sx={{
                ...actionButtonSx,
                color: "error.main",
                borderColor: "error.light",
                bgcolor: "rgba(211, 47, 47, 0.06)",
                "&:hover": {
                  color: "error.dark",
                  borderColor: "error.main",
                  bgcolor: "rgba(211, 47, 47, 0.12)",
                },
              }}
              onClick={() => {
                remove.reset();
                setDeleteTarget(row);
              }}
            >
              <DeleteOutlineRounded fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];
  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Box>
          <Typography variant="h3">จัดการตำแหน่งและ QR</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            ตั้งค่าจุดแจ้งเหตุและดาวน์โหลด QR สำหรับติดหน้างาน
          </Typography>
        </Box>
        <Button
          component={Link}
          to="/locations/new"
          variant="contained"
          startIcon={<AddOutlined />}
        >
          เพิ่มตำแหน่ง
        </Button>
      </Box>
      <MainCard
        title={
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <QrCode2Outlined color="primary" />
            <Typography variant="h5">รายการตำแหน่ง</Typography>
          </Stack>
        }
      >
        {locations.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {locations.error instanceof Error
              ? locations.error.message
              : "ไม่สามารถโหลดรายการตำแหน่งได้"}
          </Alert>
        )}
        {downloadError && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() => setDownloadError(undefined)}
          >
            {downloadError}
          </Alert>
        )}
        <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
          แนะนำติดตั้ง QR ที่ระดับสายตา 120–150 ซม. จากพื้น
          ใกล้จุดที่มักเกิดปัญหา และไม่ถูกบดบัง
        </Alert>
        <GenericDataTable
          rows={locations.data ?? []}
          columns={columns}
          loading={locations.isLoading}
          emptyMessage="ยังไม่มีตำแหน่ง"
        />
      </MainCard>
      <ActionDialog
        open={Boolean(deleteTarget)}
        maxWidth="xs"
        title="ยืนยันการลบ QR Code"
        icon={<DeleteOutlineRounded sx={{ color: "error.main" }} />}
        onRequestClose={() => !remove.isPending && setDeleteTarget(undefined)}
        footer={
          <>
            <Button onClick={() => setDeleteTarget(undefined)} disabled={remove.isPending}>
              ยกเลิก
            </Button>
            <Button
              color="error"
              variant="contained"
              startIcon={<DeleteOutlineRounded />}
              disabled={remove.isPending}
              onClick={() => deleteTarget && remove.mutate(deleteTarget.id)}
            >
              {remove.isPending ? "กำลังตรวจสอบ..." : "ลบ QR Code"}
            </Button>
          </>
        }
      >
        {deleteTarget && (
          <Stack spacing={1.5}>
            <Box>
              <Typography sx={{ fontWeight: 700 }}>
                {getLocationTitle(deleteTarget)}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: ".85rem" }}>
                ระบบจะตรวจสอบก่อนว่าจุดนี้ถูกใช้ในรายการแจ้งเหตุ แผน PM หรือแผนผังสถานที่หรือไม่
              </Typography>
            </Box>
            {remove.isError && (
              <Alert severity="error">
                QR Code กำลังถูกใช้งานอยู่ ไม่สามารถลบได้
              </Alert>
            )}
          </Stack>
        )}
      </ActionDialog>
      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={4000}
        onClose={() => setFeedback(undefined)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="success" variant="filled" onClose={() => setFeedback(undefined)}>
          {feedback}
        </Alert>
      </Snackbar>
      <Dialog
        open={Boolean(preview)}
        onClose={() => setPreview(undefined)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>QR สำหรับจุดแจ้งเหตุ</DialogTitle>
        {preview && (
          <>
            <DialogContent>
              <Stack
                spacing={2}
                sx={{ alignItems: "center", textAlign: "center" }}
              >
                <Box
                  component="img"
                  src={preview.image}
                  alt="QR สำหรับจุดแจ้งเหตุ"
                  sx={{
                    width: "100%",
                    maxWidth: 280,
                  }}
                />
                <Typography sx={{ fontWeight: 700 }}>
                    {getLocationTitle(preview.location)}
                  </Typography>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPreview(undefined)}>ปิด</Button>
              <Button
                variant="contained"
                startIcon={<DownloadOutlined />}
                disabled={downloadingLocationId === preview.location.id}
                onClick={() => void handleDownload(preview.location)}
              >
                {downloadingLocationId === preview.location.id
                  ? "กำลังสร้าง PNG..."
                  : "ดาวน์โหลด PNG"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Stack>
  );
}
