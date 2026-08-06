import {
  AddOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  QrCode2Outlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Typography } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import QRCode from "qrcode";
import { Link } from "react-router-dom";
import { useState } from "react";
import { GenericDataTable } from "../../components/GenericDataTable";
import { MainCard } from "../../components/base/MainCard";
import { useEntityDeleteMutation, useEntityQuery } from "../../hooks/useEntity";
import type { ManagedLocation } from "../../types/location";

const downloadQr = async (location: ManagedLocation) => {
  const asset = location.assetName
    ? `&asset=${encodeURIComponent(location.assetName)}`
    : "";
  const url = `${window.location.origin}/incidents/new?loc=${encodeURIComponent(location.code)}${asset}`;
  const image = await QRCode.toDataURL(url, {
    width: 768,
    margin: 2,
    color: { dark: "#4B3B86", light: "#FFFFFF" },
  });
  const link = document.createElement("a");
  link.href = image;
  link.download = `QR-${location.code}.png`;
  link.click();
};

const getQrImage = (location: ManagedLocation) => {
  const asset = location.assetName ? `&asset=${encodeURIComponent(location.assetName)}` : "";
  return QRCode.toDataURL(`${window.location.origin}/incidents/new?loc=${encodeURIComponent(location.code)}${asset}`, { width: 768, margin: 2, color: { dark: "#4B3B86", light: "#FFFFFF" } });
};

export function LocationManagementPage() {
  const locations = useEntityQuery("locations");
  const remove = useEntityDeleteMutation("locations");
  const [preview, setPreview] = useState<{ location: ManagedLocation; image: string }>();
  const columns: GridColDef<ManagedLocation>[] = [
    { field: "code", headerName: "รหัส QR", width: 160 },
    { field: "building", headerName: "อาคาร", width: 120 },
    { field: "floor", headerName: "ชั้น", width: 100 },
    { field: "zone", headerName: "โซน", width: 110 },
    { field: "assetName", headerName: "ชิ้นงาน", minWidth: 220, flex: 1 },
    {
      field: "actions",
      headerName: "",
      width: 176,
      sortable: false,
      renderCell: ({ row }) => (
        <Stack direction="row">
          <IconButton aria-label={`ดู QR ${row.code}`} onClick={async () => setPreview({ location: row, image: await getQrImage(row) })}>
            <VisibilityOutlined fontSize="small" />
          </IconButton>
          <IconButton onClick={() => downloadQr(row)}>
            <DownloadOutlined fontSize="small" />
          </IconButton>
          <IconButton component={Link} to={`/locations/${row.id}`}>
            <EditOutlined fontSize="small" />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => {
              if (window.confirm(`ลบตำแหน่ง ${row.code} ใช่หรือไม่`))
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
        <GenericDataTable
          rows={locations.data ?? []}
          columns={columns}
          loading={locations.isLoading}
          emptyMessage="ยังไม่มีตำแหน่ง"
        />
      </MainCard>
      <Dialog open={Boolean(preview)} onClose={() => setPreview(undefined)} maxWidth="xs" fullWidth>
        <DialogTitle>QR สำหรับจุดแจ้งเหตุ</DialogTitle>
        {preview && <><DialogContent><Stack spacing={2} sx={{ alignItems: "center", textAlign: "center" }}><Box component="img" src={preview.image} alt={`QR ${preview.location.code}`} sx={{ width: "100%", maxWidth: 280, border: 1, borderColor: "divider" }} /><Box><Typography sx={{ fontWeight: 700 }}>{preview.location.assetName || preview.location.code}</Typography><Typography variant="body2" color="text.secondary">{preview.location.building} · {preview.location.floor} · {preview.location.zone}</Typography><Typography variant="caption" color="text.secondary">สแกนแล้วเปิดหน้าแจ้งปัญหาพร้อมตำแหน่งนี้</Typography></Box></Stack></DialogContent><DialogActions><Button onClick={() => setPreview(undefined)}>ปิด</Button><Button variant="contained" startIcon={<DownloadOutlined />} onClick={() => downloadQr(preview.location)}>ดาวน์โหลด PNG</Button></DialogActions></>}
      </Dialog>
    </Stack>
  );
}
