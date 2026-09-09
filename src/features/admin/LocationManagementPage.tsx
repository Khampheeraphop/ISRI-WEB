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
    { field: "building", headerName: "อาคาร", width: 240 },
    { field: "floor", headerName: "ชั้น", width: 100 },
    { field: "zone", headerName: "โซน", width: 240 },
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
