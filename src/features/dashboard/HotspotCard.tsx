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
      title={<Typography variant="h6">จุดพบปัญหาซ้ำ</Typography>}
      subheader="5 อันดับที่แจ้งตั้งแต่ 2 ครั้งในเดือนที่เลือก · ไม่นับรายการที่ไม่รับ"
      action={
        data.hotspotGroups && (
          <FormControl size="small" sx={{ minWidth: 110 }}>
            <InputLabel id="hotspot-level">จัดกลุ่มตาม</InputLabel>
            <Select
              labelId="hotspot-level"
              label="จัดกลุ่มตาม"
              value={level}
              onChange={(event) =>
                setLevel(event.target.value as keyof typeof levels)
              }
              sx={{ bgcolor: "background.paper", fontSize: "0.875rem" }}
            >
              {Object.entries(levels).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )
      }
    >
      {rows.length ? (
        rows.map((item, index) => (
          <Box
            key={item.key ?? `${item.locationLabel}-${item.assetName}`}
            sx={{
              display: "grid",
              gridTemplateColumns: "32px minmax(0, 1fr) auto",
              gap: 1.75,
              alignItems: "center",
              py: 1.35,
              borderBottom: index === rows.length - 1 ? 0 : 1,
              borderColor: "divider",
              transition: "background-color 0.15s ease",
              borderRadius: 1,
              px: 0.5,
              "&:hover": {
                bgcolor: "rgba(75, 59, 134, 0.02)",
              },
            }}
          >
            {/* Rank Badge */}
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "0.8125rem",
                bgcolor:
                  index === 0
                    ? "rgba(75, 59, 134, 0.12)"
                    : index < 3
                      ? "rgba(75, 59, 134, 0.07)"
                      : "rgba(0, 0, 0, 0.04)",
                color: index < 3 ? "primary.main" : "text.secondary",
                flexShrink: 0,
              }}
            >
              {index + 1}
            </Box>

            {/* Location & Detail */}
            <Box sx={{ minWidth: 0, overflowWrap: "anywhere" }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                  lineHeight: 1.4,
                }}
              >
                {item.locationLabel}
              </Typography>
              {level === "asset" && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt: 0.2 }}
                >
                  {item.assetName || "ไม่ระบุชิ้นงาน"}
                </Typography>
              )}
            </Box>

            {/* Metrics */}
            <Box sx={{ textAlign: "right", pl: 1, flexShrink: 0 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {item.count} ครั้ง
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  fontWeight: item.openCount ? 600 : 400,
                  color: item.openCount ? "warning.main" : "text.secondary",
                  mt: 0.2,
                }}
              >
                ค้าง {item.openCount} งาน
              </Typography>
            </Box>
          </Box>
        ))
      ) : (
        <Box sx={{ py: 3, textAlign: "center" }}>
          <Typography color="text.secondary">
            ยังไม่พบจุดที่มีการแจ้งซ้ำในช่วงเวลาที่เลือก
          </Typography>
        </Box>
      )}
    </MainCard>
  );
}
