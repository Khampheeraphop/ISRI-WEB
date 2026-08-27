import {
  AddOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  QrCode2Outlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import QRCode from "qrcode";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GenericDataTable } from "../../components/GenericDataTable";
import { MainCard } from "../../components/base/MainCard";
import { tableColumnAlignment } from "../../components/dataTable.constants";
import type { ManagedLocation } from "../../types/location";
import { deleteManagedLocation, getManagedLocations } from "./locationsApi";

// A6 portrait at 300 DPI. The 720 px QR prints at about 61 mm, which is
// comfortably scannable when the label is mounted on a wall or equipment.
const QR_SIZE = 720;
const POSTER_WIDTH = 1240;
const POSTER_HEIGHT = 1748;

const getQrUrl = (location: ManagedLocation) => {
  const asset = location.assetName
    ? `&asset=${encodeURIComponent(location.assetName)}`
    : "";
  return `${window.location.origin}/incidents/new?loc=${encodeURIComponent(location.code)}${asset}`;
};

const getLocationTitle = (location: ManagedLocation) =>
  location.assetName ||
  `${location.building} · ${location.floor} · ${location.zone}`;

const getDownloadFileName = (location: ManagedLocation) =>
  `QR-${getLocationTitle(location)}`
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120) + ".png";

const loadImage = (source: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });

const roundedRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.closePath();
};

const drawWrappedText = (
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 2,
) => {
  const lines: string[] = [];
  let line = "";
  for (const character of Array.from(text)) {
    const candidate = `${line}${character}`;
    if (context.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = character;
      if (lines.length === maxLines - 1) break;
    } else line = candidate;
  }
  if (line && lines.length < maxLines) {
    const consumed = lines.join("").length + line.length;
    lines.push(consumed < text.length ? `${line.slice(0, -1)}…` : line);
  }
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
  context.fillStyle = "#1F1E23";
  context.font = "700 42px Anuphan, sans-serif";
  context.fillText("ISRI", POSTER_WIDTH / 2, 112);
  context.fillStyle = "#68636C";
  context.font = "500 28px Anuphan, sans-serif";
  context.fillText("สแกนเพื่อแจ้งปัญหาโครงสร้างพื้นฐาน", POSTER_WIDTH / 2, 158);
  context.strokeStyle = "#E7E2DC";
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(160, 206);
  context.lineTo(POSTER_WIDTH - 160, 206);
  context.stroke();

  context.fillStyle = "#4B3B86";
  context.font = "600 25px Anuphan, sans-serif";
  context.fillText("จุดแจ้งเหตุ", POSTER_WIDTH / 2, 270);
  context.fillStyle = "#25232A";
  context.font = "700 34px Anuphan, sans-serif";
  drawWrappedText(
    context,
    getLocationTitle(location),
    POSTER_WIDTH / 2,
    326,
    POSTER_WIDTH - 220,
    42,
  );
  context.fillStyle = "#726D76";
  context.font = "500 27px Anuphan, sans-serif";
  context.fillText(
    `${location.building} · ${location.floor} · ${location.zone}`,
    POSTER_WIDTH / 2,
    430,
  );

  context.fillStyle = "#FFFFFF";
  context.strokeStyle = "#ECE8E1";
  context.lineWidth = 3;
  roundedRect(context, 170, 490, POSTER_WIDTH - 340, POSTER_WIDTH - 340, 16);
  context.fill();
  context.stroke();
  context.drawImage(qrImage, 260, 580, QR_SIZE, QR_SIZE);

  context.fillStyle = "#2A2830";
  context.font = "600 30px Anuphan, sans-serif";
  context.fillText("สแกน QR เพื่อเปิดแบบฟอร์มแจ้งปัญหา", POSTER_WIDTH / 2, 1435);
  context.fillStyle = "#77717A";
  context.font = "500 25px Anuphan, sans-serif";
  context.fillText("ระบบจะระบุตำแหน่งให้โดยอัตโนมัติ", POSTER_WIDTH / 2, 1485);
  context.fillStyle = "#A7A1AA";
  context.font = "500 22px Anuphan, sans-serif";
  context.fillText(`รหัสจุด: ${location.code}`, POSTER_WIDTH / 2, 1575);
  return canvas.toDataURL("image/png");
};

const downloadQr = async (location: ManagedLocation) => {
  const image = await getQrPoster(location);
  const link = document.createElement("a");
  link.href = image;
  link.download = getDownloadFileName(location);
  link.click();
};

export function LocationManagementPage() {
  const queryClient = useQueryClient();
  const locations = useQuery({
    queryKey: ["managed-locations"],
    queryFn: getManagedLocations,
  });
  const remove = useMutation({
    mutationFn: deleteManagedLocation,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["managed-locations"] }),
  });
  const [preview, setPreview] = useState<{
    location: ManagedLocation;
    image: string;
  }>();
  const columns: GridColDef<ManagedLocation>[] = [
    { field: "building", headerName: "อาคาร", width: 120 },
    { field: "floor", headerName: "ชั้น", width: 100 },
    { field: "zone", headerName: "โซน", width: 110 },
    { field: "assetName", headerName: "ชิ้นงาน", minWidth: 220, flex: 1 },
    {
      field: "actions",
      headerName: "จัดการ",
      width: 176,
      ...tableColumnAlignment.actions,
      renderCell: ({ row }) => (
        <Stack direction="row" sx={{ width: "100%", justifyContent: "center" }}>
          <IconButton
            aria-label="ดู QR"
            onClick={async () =>
              setPreview({ location: row, image: await getQrCodeImage(row) })
            }
          >
            <VisibilityOutlined fontSize="small" />
          </IconButton>
          <IconButton aria-label="ดาวน์โหลด QR" onClick={() => downloadQr(row)}>
            <DownloadOutlined fontSize="small" />
          </IconButton>
          <IconButton
            component={Link}
            to={`/locations/${row.id}`}
            aria-label="แก้ไขตำแหน่ง"
          >
            <EditOutlined fontSize="small" />
          </IconButton>
          <IconButton
            aria-label="ลบตำแหน่ง"
            color="error"
            onClick={() => {
              if (
                window.confirm(
                  `ลบจุดแจ้งเหตุ ${row.building} · ${row.floor} · ${row.zone} ใช่หรือไม่`,
                )
              )
                remove.mutate(row.id);
            }}
          >
            <DeleteOutlined fontSize="small" />
          </IconButton>
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
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>
                    {getLocationTitle(preview.location)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {preview.location.building} · {preview.location.floor} · {preview.location.zone}
                  </Typography>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPreview(undefined)}>ปิด</Button>
              <Button
                variant="contained"
                startIcon={<DownloadOutlined />}
                onClick={() => downloadQr(preview.location)}
              >
                ดาวน์โหลด PNG
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Stack>
  );
}
