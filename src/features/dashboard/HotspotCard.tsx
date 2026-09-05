import { useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { MainCard } from "../../components/base/MainCard";
import type { DashboardSummary } from "./dashboardApi";

const levels = {
  building: "อาคาร",
  floor: "ชั้น",
  area: "พื้นที่",
  asset: "ชิ้นงาน",
};
export function HotspotCard({ data }: { data: DashboardSummary }) {
  const [level, setLevel] = useState<keyof typeof levels>("asset");
  const rows = data.hotspotGroups?.[level] ?? data.hotspots;
  return (
    <MainCard
      title="จุดพบปัญหาซ้ำ"
      subheader="5 อันดับที่แจ้งตั้งแต่ 2 ครั้งในเดือนที่เลือก · ไม่นับรายการที่ไม่รับ"
    >
      {data.hotspotGroups && (
        <FormControl size="small" fullWidth sx={{ mb: 2 }}>
          <InputLabel id="hotspot-level">จัดกลุ่มตาม</InputLabel>
          <Select
            labelId="hotspot-level"
            label="จัดกลุ่มตาม"
            value={level}
            onChange={(event) =>
              setLevel(event.target.value as keyof typeof levels)
            }
          >
            {Object.entries(levels).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      {rows.length ? (
        rows.map((item, index) => (
          <Box
            key={item.key ?? `${item.locationLabel}-${item.assetName}`}
            sx={{
              display: "grid",
              gridTemplateColumns: "24px minmax(0, 1fr) auto",
              gap: 1,
              py: 1.5,
              borderBottom: index === rows.length - 1 ? 0 : 1,
              borderColor: "divider",
            }}
          >
            <Typography color="primary.main" sx={{ fontWeight: 700 }}>
              {index + 1}
            </Typography>
            <Box sx={{ minWidth: 0, overflowWrap: "anywhere" }}>
              <Typography sx={{ fontWeight: 600 }}>
                {item.locationLabel}
              </Typography>
              {level === "asset" && (
                <Typography variant="body2" color="text.secondary">
                  {item.assetName || "ไม่ระบุชิ้นงาน"}
                </Typography>
              )}
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography sx={{ fontWeight: 700 }}>
                {item.count} ครั้ง
              </Typography>
              <Typography
                variant="caption"
                color={item.openCount ? "warning.main" : "text.secondary"}
              >
                ค้าง {item.openCount} งาน
              </Typography>
            </Box>
          </Box>
        ))
      ) : (
        <Typography color="text.secondary">
          ยังไม่พบจุดที่มีการแจ้งซ้ำในช่วงเวลาที่เลือก
        </Typography>
      )}
    </MainCard>
  );
}
