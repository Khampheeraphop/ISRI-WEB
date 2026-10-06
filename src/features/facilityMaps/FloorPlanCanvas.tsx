import { Box, Chip, Stack, Typography } from "@mui/material";
import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { FloorPlanElement } from "./facilityMapsApi";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const legendItems = [
  { label: "ห้อง", color: "#4e399b", shape: "room" },
  { label: "QR พื้นที่/ห้อง", color: "#1976d2", shape: "pin" },
  { label: "QR ชิ้นงาน", color: "#d97706", shape: "pin" },
  { label: "ข้อความประกอบ", color: "#25232a", shape: "text" },
] as const;

export function FloorPlanCanvas({
  elements,
  backgroundUrl,
  aspectRatio,
  editable = false,
  selectedId,
  highlightedLocationId,
  onSelect,
  onChange,
}: {
  elements: FloorPlanElement[];
  backgroundUrl?: string | null;
  aspectRatio: number;
  editable?: boolean;
  selectedId?: string | null;
  highlightedLocationId?: string | null;
  onSelect?: (id: string | null) => void;
  onChange?: (elements: FloorPlanElement[]) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const moveElement = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!editable || !dragId || !svgRef.current || !onChange) return;
    const rect = svgRef.current.getBoundingClientRect();
    const element = elements.find((item) => item.id === dragId);
    if (!element || rect.width <= 0 || rect.height <= 0) return;
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    onChange(
      elements.map((item) =>
        item.id === dragId
          ? {
              ...item,
              x: Number(clamp(x - item.width / 2, 0, 100 - item.width).toFixed(2)),
              y: Number(clamp(y - item.height / 2, 0, 100 - item.height).toFixed(2)),
            }
          : item,
      ),
    );
  };

  const beginDrag = (
    event: ReactPointerEvent<SVGGElement>,
    element: FloorPlanElement,
  ) => {
    event.stopPropagation();
    onSelect?.(element.id);
    if (!editable) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragId(element.id);
  };

  return (
    <Stack spacing={1.25}>
      <Stack
        direction="row"
        useFlexGap
        spacing={0.75}
        aria-label="คำอธิบายสัญลักษณ์บนผัง"
        sx={{ flexWrap: "wrap" }}
      >
        {legendItems.map((item) => (
          <Chip
            key={item.label}
            size="small"
            variant="outlined"
            label={item.label}
            icon={
              <Box
                component="span"
                sx={{
                  width: item.shape === "room" ? 14 : 10,
                  height: item.shape === "text" ? 3 : 10,
                  borderRadius: item.shape === "room" ? 0.75 : "50%",
                  bgcolor: item.color,
                  display: "inline-block",
                }}
              />
            }
            sx={{ bgcolor: "background.paper", borderColor: "divider" }}
          />
        ))}
      </Stack>
      <Box
        sx={{
          overflow: "hidden",
          border: "2px solid",
          borderColor: "#8b7bc8",
          borderRadius: 3,
          bgcolor: "background.paper",
          boxShadow: "0 8px 24px rgba(49, 38, 91, 0.08)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 1.75,
            py: 1,
            bgcolor: "#f3f0fb",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 800, color: "primary.dark" }}>
            ขอบเขตแผนผัง
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {editable ? "คลิกเพื่อเลือก · ลากเพื่อย้าย" : "กดห้องหรือหมุดเพื่อดูรายละเอียด"}
          </Typography>
        </Box>
        <Box
          sx={{
            width: "100%",
            aspectRatio,
            minHeight: 280,
            bgcolor: "#fbfaff",
            backgroundImage:
              "linear-gradient(rgba(78,57,155,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(78,57,155,.07) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        >
          <svg
            ref={svgRef}
            data-floor-plan-canvas
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            width="100%"
            height="100%"
            style={{ display: "block", touchAction: editable ? "none" : "auto" }}
            onPointerMove={moveElement}
            onPointerUp={() => setDragId(null)}
            onPointerCancel={() => setDragId(null)}
            onClick={(event) => {
              if (event.target === event.currentTarget) onSelect?.(null);
            }}
          >
            <rect
              x="0.35"
              y="0.35"
              width="99.3"
              height="99.3"
              rx="1.5"
              fill="none"
              stroke="#8b7bc8"
              strokeWidth="0.7"
              vectorEffect="non-scaling-stroke"
              pointerEvents="none"
            />
            {backgroundUrl && (
              <image
                href={backgroundUrl}
                x="0"
                y="0"
                width="100"
                height="100"
                preserveAspectRatio="none"
                opacity="0.72"
              />
            )}
            {!backgroundUrl && elements.length === 0 && (
              <g pointerEvents="none">
                <text
                  x="50"
                  y="48"
                  textAnchor="middle"
                  fontSize="3.2"
                  fontWeight="800"
                  fill="#4e399b"
                >
                  เริ่มจาก “เพิ่มกรอบห้อง”
                </text>
                <text
                  x="50"
                  y="54"
                  textAnchor="middle"
                  fontSize="2.2"
                  fill="#6f6a7a"
                >
                  แล้วลากห้องไปยังตำแหน่งจริงบนผัง
                </text>
              </g>
            )}
            {elements.map((element) => {
              const isSelected = selectedId === element.id;
              const isHighlighted = Boolean(highlightedLocationId) &&
                highlightedLocationId === element.locationId;
              const stroke = isHighlighted ? "#d32f2f" : isSelected ? "#4e399b" : element.color;
              const cx = element.x + element.width / 2;
              const cy = element.y + element.height / 2;

              if (element.locationId) {
                const markerColor = element.type === "asset" ? "#d97706" : "#1976d2";
                const labelWidth = Math.min(30, Math.max(14, element.name.length * 1.65));
                return (
                  <g
                    key={element.id}
                    role="button"
                    aria-label={`QR ${element.type === "asset" ? "ชิ้นงาน" : "พื้นที่/ห้อง"} ${element.name}`}
                    onPointerDown={(event) => beginDrag(event, element)}
                    style={{ cursor: editable ? "grab" : "pointer" }}
                  >
                    {(isSelected || isHighlighted) && (
                      <circle cx={cx} cy={cy} r="5.6" fill={isHighlighted ? "#d32f2f" : markerColor} opacity="0.16" />
                    )}
                    <path
                      d={`M ${cx} ${cy + 4.2} C ${cx - 5.5} ${cy - 1.2}, ${cx - 3.7} ${cy - 6.2}, ${cx} ${cy - 6.2} C ${cx + 3.7} ${cy - 6.2}, ${cx + 5.5} ${cy - 1.2}, ${cx} ${cy + 4.2} Z`}
                      fill={markerColor}
                      stroke={isHighlighted ? "#d32f2f" : "#ffffff"}
                      strokeWidth={isHighlighted ? "1.2" : "0.8"}
                      vectorEffect="non-scaling-stroke"
                    />
                    <circle cx={cx} cy={cy - 2.1} r="1.35" fill="#ffffff" />
                    <rect
                      x={cx - labelWidth / 2}
                      y={cy + 5.4}
                      width={labelWidth}
                      height="7"
                      rx="1.4"
                      fill="#ffffff"
                      stroke={markerColor}
                      strokeWidth="0.45"
                      vectorEffect="non-scaling-stroke"
                    />
                    <text x={cx} y={cy + 8.1} textAnchor="middle" fontSize="1.7" fontWeight="800" fill={markerColor}>
                      {element.type === "asset" ? "QR ชิ้นงาน" : "QR พื้นที่/ห้อง"}
                    </text>
                    <text x={cx} y={cy + 10.7} textAnchor="middle" fontSize="2" fontWeight="700" fill="#25232a">
                      {element.name.slice(0, 28)}
                    </text>
                  </g>
                );
              }

              if (element.type === "asset") {
                return (
                  <g
                    key={element.id}
                    role="button"
                    aria-label={`ชิ้นงานประกอบ ${element.name}`}
                    onPointerDown={(event) => beginDrag(event, element)}
                    style={{ cursor: editable ? "grab" : "pointer" }}
                  >
                    <rect x={cx - 2.5} y={cy - 2.5} width="5" height="5" rx="1" fill={element.color} stroke={stroke} strokeWidth={isSelected ? "1.2" : "0.6"} vectorEffect="non-scaling-stroke" />
                    <text x={cx} y={cy + 6} textAnchor="middle" fontSize={element.fontSize ?? 2.5} fontWeight="700" fill="#25232a">
                      {element.name.slice(0, 28)}
                    </text>
                  </g>
                );
              }

              if (element.type === "label") {
                return (
                  <g key={element.id} onPointerDown={(event) => beginDrag(event, element)} style={{ cursor: editable ? "grab" : "default" }}>
                    {isSelected && (
                      <rect x={element.x} y={element.y} width={element.width} height={element.height} rx="1" fill="transparent" stroke="#4e399b" strokeDasharray="2 1" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
                    )}
                    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize={element.fontSize ?? 3.5} fontWeight="700" fill={stroke}>
                      {element.name.slice(0, 42)}
                    </text>
                  </g>
                );
              }

              return (
                <g
                  key={element.id}
                  role="button"
                  aria-label={`${element.type === "room" ? "ห้อง" : "พื้นที่"} ${element.name}`}
                  onPointerDown={(event) => beginDrag(event, element)}
                  style={{ cursor: editable ? "grab" : "pointer" }}
                >
                  <rect x={element.x} y={element.y} width={element.width} height={element.height} rx="1.5" fill={element.color} fillOpacity="0.12" stroke={stroke} strokeWidth={isSelected ? "1.3" : "0.7"} strokeDasharray={element.type === "area" ? "2 1" : undefined} vectorEffect="non-scaling-stroke" />
                  <rect x={element.x} y={element.y} width={element.width} height="3.2" rx="1.5" fill={element.color} opacity="0.78" />
                  <text x={element.x + 1.4} y={element.y + 2.25} fontSize="1.45" fontWeight="800" fill="#ffffff">
                    {element.type === "room" ? "ห้อง" : "พื้นที่"}
                  </text>
                  <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fontSize={element.fontSize ?? 3} fontWeight="700" fill="#25232a">
                    {element.name.slice(0, 36)}
                  </text>
                </g>
              );
            })}
          </svg>
        </Box>
      </Box>
    </Stack>
  );
}
