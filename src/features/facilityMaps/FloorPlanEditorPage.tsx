import {
  AddBoxOutlined,
  ArrowBackOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  DownloadOutlined,
  Inventory2Outlined,
  LabelOutlined,
  MeetingRoomOutlined,
  PlaceOutlined,
  SaveOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MainCard } from "../../components/base/MainCard";
import { getManagedLocations } from "../admin/locationsApi";
import { FloorPlanCanvas } from "./FloorPlanCanvas";
import {
  getFloorPlan,
  saveFloorPlan,
  uploadFloorPlanBackground,
  type FloorPlanBackground,
  type FloorPlanElement,
} from "./facilityMapsApi";

type EditorState = {
  id?: string;
  building: string;
  floor: string;
  name: string;
  canvasWidth: number;
  canvasHeight: number;
  background: FloorPlanBackground | null;
  backgroundUrl: string | null;
  elements: FloorPlanElement[];
  isPublished: boolean;
};

const emptyState: EditorState = {
  building: "",
  floor: "",
  name: "แผนผังสถานที่",
  canvasWidth: 1600,
  canvasHeight: 1000,
  background: null,
  backgroundUrl: null,
  elements: [],
  isPublished: false,
};

const newElementId = () => `element-${crypto.randomUUID()}`;

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
};

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

async function exportCanvasAsPng(
  svg: SVGSVGElement,
  state: EditorState,
) {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("width", String(state.canvasWidth));
  clone.setAttribute("height", String(state.canvasHeight));
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const image = clone.querySelector("image");
  if (image && state.backgroundUrl) {
    const response = await fetch(state.backgroundUrl);
    if (response.ok) image.setAttribute("href", await blobToDataUrl(await response.blob()));
  }
  const source = new XMLSerializer().serializeToString(clone);
  const svgUrl = URL.createObjectURL(new Blob([source], { type: "image/svg+xml" }));
  try {
    const rendered = new Image();
    await new Promise<void>((resolve, reject) => {
      rendered.onload = () => resolve();
      rendered.onerror = reject;
      rendered.src = svgUrl;
    });
    const canvas = document.createElement("canvas");
    canvas.width = state.canvasWidth;
    canvas.height = state.canvasHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("ไม่สามารถสร้างรูปภาพได้");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(rendered, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (value) => value ? resolve(value) : reject(new Error("ไม่สามารถสร้าง PNG ได้")),
        "image/png",
      ),
    );
    downloadBlob(blob, `${state.building}-${state.floor}-facility-map.png`);
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

export function FloorPlanEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<EditorState>(emptyState);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [locationId, setLocationId] = useState("");
  const [message, setMessage] = useState<string>();
  const locations = useQuery({
    queryKey: ["managed-locations"],
    queryFn: getManagedLocations,
  });
  const plan = useQuery({
    queryKey: ["floor-plan", id],
    queryFn: () => getFloorPlan(id ?? ""),
    enabled: Boolean(id && id !== "new"),
  });
  useEffect(() => {
    if (!plan.data) return;
    setState({
      id: plan.data.id,
      building: plan.data.building,
      floor: plan.data.floor,
      name: plan.data.name,
      canvasWidth: plan.data.canvasWidth,
      canvasHeight: plan.data.canvasHeight,
      background: plan.data.background,
      backgroundUrl: plan.data.backgroundUrl,
      elements: plan.data.elements,
      isPublished: plan.data.isPublished,
    });
  }, [plan.data]);
  useEffect(() => {
    if (id !== "new" || state.building || !locations.data?.length) return;
    const first = locations.data[0];
    setState((current) => ({
      ...current,
      building: first.building,
      floor: first.floor,
      name: `แผนผัง ${first.building} ${first.floor}`,
    }));
  }, [id, locations.data, state.building]);

  const currentLocations = useMemo(
    () =>
      (locations.data ?? []).filter(
        (item) => item.building === state.building && item.floor === state.floor,
      ),
    [locations.data, state.building, state.floor],
  );
  const placedLocationIds = useMemo(
    () =>
      new Set(
        state.elements.flatMap((element) =>
          element.locationId ? [element.locationId] : [],
        ),
      ),
    [state.elements],
  );
  const selectedLocation = currentLocations.find((item) => item.id === locationId);
  const selected = state.elements.find((element) => element.id === selectedId);
  const activeRoom = state.elements.find((element) => element.id === activeRoomId);
  const visibleElements = state.elements.filter(
    (element) => (element.parentId ?? null) === activeRoomId,
  );
  const save = useMutation({
    mutationFn: () => saveFloorPlan(state),
    onSuccess: async (saved) => {
      await queryClient.invalidateQueries({ queryKey: ["floor-plans"] });
      setMessage(`บันทึกเวอร์ชัน ${saved.version} แล้ว`);
      navigate(`/facility-maps/${saved.id}/edit`, { replace: true });
    },
  });
  const upload = useMutation({
    mutationFn: uploadFloorPlanBackground,
    onSuccess: (background, file) => {
      setState((current) => ({
        ...current,
        background,
        backgroundUrl: URL.createObjectURL(file),
      }));
    },
  });

  const addElement = (element: FloorPlanElement) => {
    setState((current) => ({
      ...current,
      elements: [...current.elements, { ...element, parentId: activeRoomId }],
    }));
    setSelectedId(element.id);
  };
  const deleteElement = (element: FloorPlanElement) => {
    setState((current) => ({
      ...current,
      elements: current.elements.filter(
        (item) => item.id !== element.id && item.parentId !== element.id,
      ),
    }));
    setSelectedId(null);
    if (activeRoomId === element.id) setActiveRoomId(null);
  };
  const openRoom = (roomId: string) => {
    setActiveRoomId(roomId);
    setSelectedId(null);
  };
  const updateSelected = (patch: Partial<FloorPlanElement>) => {
    if (!selectedId) return;
    setState((current) => ({
      ...current,
      elements: current.elements.map((element) =>
        element.id === selectedId ? { ...element, ...patch } : element,
      ),
    }));
  };

  if (plan.isLoading || locations.isLoading) {
    return <Box sx={{ minHeight: 360, display: "grid", placeItems: "center" }}><CircularProgress /></Box>;
  }
  if (plan.error) {
    return <Alert severity="error">{plan.error.message}</Alert>;
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Button component={Link} to="/facility-maps" startIcon={<ArrowBackOutlined />} sx={{ mb: 1 }}>
          กลับไปหน้าแผนผัง
        </Button>
        <Typography variant="h3">{state.id ? "แก้ไขแผนผัง" : "สร้างแผนผังใหม่"}</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          สร้างห้อง เชื่อม QR แล้วลากแต่ละรายการไปยังตำแหน่งจริง
        </Typography>
      </Box>
      {(save.error || upload.error) && (
        <Alert severity="error">{(save.error ?? upload.error)?.message}</Alert>
      )}
      {message && <Alert severity="success" onClose={() => setMessage(undefined)}>{message}</Alert>}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "300px minmax(0, 1fr)" }, gap: 2 }}>
        <Stack spacing={2}>
          <MainCard title={<Typography variant="h6">ข้อมูลผัง</Typography>}>
            <Stack spacing={1.5}>
              <TextField label="ชื่อผัง" value={state.name} onChange={(event) => setState((current) => ({ ...current, name: event.target.value }))} />
              <TextField label="อาคาร" value={state.building} onChange={(event) => setState((current) => ({ ...current, building: event.target.value }))} />
              <TextField label="ชั้น" value={state.floor} onChange={(event) => setState((current) => ({ ...current, floor: event.target.value }))} />
              <Button component="label" variant="outlined" startIcon={<CloudUploadOutlined />} disabled={upload.isPending}>
                {upload.isPending ? "กำลังอัปโหลด…" : "อัปโหลดรูปพื้นหลัง"}
                <input hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) upload.mutate(file);
                  event.target.value = "";
                }} />
              </Button>
              {state.background && (
                <Button color="error" size="small" onClick={() => setState((current) => ({ ...current, background: null, backgroundUrl: null }))}>
                  เอารูปพื้นหลังออก
                </Button>
              )}
              <FormControlLabel
                control={<Switch checked={state.isPublished} onChange={(_, checked) => setState((current) => ({ ...current, isPublished: checked }))} />}
                label="เผยแพร่ให้ผู้จัดสรรและช่าง"
              />
            </Stack>
          </MainCard>
          <MainCard
            title={<Typography variant="h6">เครื่องมือสร้างผัง</Typography>}
            subheader={activeRoom ? `กำลังออกแบบภายใน “${activeRoom.name}”` : "เพิ่มสิ่งที่ต้องการ แล้วลากไปยังตำแหน่งจริง"}
          >
            <Stack spacing={1.5}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>1. วาดองค์ประกอบ</Typography>
                <Typography variant="caption" color="text.secondary">
                  ใช้สร้างภาพของพื้นที่ ยังไม่เชื่อมกับใบแจ้งเหตุ
                </Typography>
              </Box>
              {!activeRoomId && <Button startIcon={<AddBoxOutlined />} variant="outlined" onClick={() => addElement({
                id: newElementId(), type: "room", name: "ห้องใหม่", x: 8, y: 8,
                width: 26, height: 20, color: "#4e399b", locationId: null, parentId: null, fontSize: 3,
              })} sx={{ justifyContent: "flex-start" }}>เพิ่มกรอบห้อง</Button>}
              {activeRoomId && <Button startIcon={<Inventory2Outlined />} variant="outlined" onClick={() => addElement({
                id: newElementId(), type: "asset", name: "ชิ้นงานใหม่", x: 12, y: 12,
                width: 6, height: 6, color: "#d97706", locationId: null, parentId: activeRoomId, fontSize: 2.5,
              })} sx={{ justifyContent: "flex-start" }}>เพิ่มชิ้นงานประกอบ</Button>}
              <Button startIcon={<LabelOutlined />} variant="outlined" onClick={() => addElement({
                id: newElementId(), type: "label", name: "ข้อความ", x: 35, y: 5,
                width: 30, height: 8, color: "#25232a", locationId: null, parentId: activeRoomId, fontSize: 3.5,
              })} sx={{ justifyContent: "flex-start" }}>เพิ่มข้อความประกอบ</Button>
              <Divider />
              <Box>
                <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>2. เชื่อมจุด QR จริง</Typography>
                  <Chip size="small" color="info" label="ใช้กับใบแจ้งเหตุ" />
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.35 }}>
                  เลือก QR จากเมนู “ตำแหน่งและ QR” แล้ววางหมุดตรงตำแหน่งจริง
                </Typography>
              </Box>
              <Select
                displayEmpty
                value={locationId}
                onChange={(event) => setLocationId(event.target.value)}
                renderValue={(value) => {
                  const location = currentLocations.find((item) => item.id === value);
                  if (!location) return "เลือก QR ที่ต้องการเชื่อม";
                  return `${location.qrScope === "asset" ? "QR ชิ้นงาน" : "QR พื้นที่/ห้อง"} · ${location.assetName ?? location.zone}`;
                }}
              >
                <MenuItem value=""><em>เลือก QR ที่ต้องการเชื่อม</em></MenuItem>
                {currentLocations.map((location) => (
                  <MenuItem key={location.id} value={location.id} disabled={placedLocationIds.has(location.id)}>
                    <Stack spacing={0.25} sx={{ py: 0.5 }}>
                      <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                        <Chip
                          size="small"
                          color={location.qrScope === "asset" ? "warning" : "info"}
                          label={location.qrScope === "asset" ? "ชิ้นงาน" : "พื้นที่/ห้อง"}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {location.assetName ?? location.zone}
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {location.zone} · {location.code}{placedLocationIds.has(location.id) ? " · วางบนผังแล้ว" : ""}
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
              {selectedLocation && (
                <Alert severity="info" icon={<PlaceOutlined />} sx={{ py: 0.5 }}>
                  หมุดนี้แทน {selectedLocation.qrScope === "asset" ? `ชิ้นงาน “${selectedLocation.assetName}”` : `พื้นที่ “${selectedLocation.zone}”`}
                </Alert>
              )}
              <Button startIcon={<PlaceOutlined />} variant="contained" disabled={!locationId} onClick={() => {
                const location = currentLocations.find((item) => item.id === locationId);
                if (!location) return;
                addElement({
                  id: newElementId(),
                  type: location.qrScope === "asset" ? "asset" : "area",
                  name: location.assetName ?? location.zone,
                  x: 45,
                  y: 45,
                  width: 6,
                  height: 6,
                  color: location.qrScope === "asset" ? "#d97706" : "#1976d2",
                  locationId: location.id,
                  parentId: activeRoomId,
                  fontSize: 2,
                });
                setLocationId("");
              }}>เพิ่มหมุด QR ลงบนผัง</Button>
            </Stack>
          </MainCard>
          {selected && (
            <MainCard
              title={<Typography variant="h6">ปรับสิ่งที่เลือก</Typography>}
              subheader="แก้ชื่อ ขนาด และสีได้จากตรงนี้"
            >
              <Stack spacing={1.5}>
                <Chip
                  size="small"
                  color={selected.locationId ? (selected.type === "asset" ? "warning" : "info") : "default"}
                  label={
                    selected.locationId
                      ? selected.type === "asset" ? "หมุด QR ชิ้นงาน" : "หมุด QR พื้นที่/ห้อง"
                      : selected.type === "room" ? "กรอบห้อง"
                      : selected.type === "asset" ? "ชิ้นงานประกอบ"
                      : selected.type === "label" ? "ข้อความประกอบ" : "พื้นที่"
                  }
                  sx={{ alignSelf: "flex-start" }}
                />
                <TextField
                  label="ชื่อที่แสดงบนผัง"
                  value={selected.name}
                  disabled={Boolean(selected.locationId)}
                  helperText={selected.locationId ? "ชื่อของหมุดอ้างอิงจากข้อมูล QR" : undefined}
                  onChange={(event) => updateSelected({ name: event.target.value })}
                />
                {selected.locationId ? (
                  <Alert severity="info">
                    หมุด QR ใช้ขนาดมาตรฐาน เพื่อให้แยกจากกรอบห้องและอ่านง่ายทุกหน้าจอ
                  </Alert>
                ) : (
                  <>
                    {(selected.type === "room" || selected.type === "asset") && (
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>ขนาดองค์ประกอบ</Typography>
                        <Stack direction="row" spacing={0.75}>
                          {[
                            { label: "เล็ก", room: [20, 14], asset: [4, 4] },
                            { label: "กลาง", room: [30, 20], asset: [6, 6] },
                            { label: "ใหญ่", room: [42, 28], asset: [9, 9] },
                          ].map((preset) => {
                            const [width, height] = selected.type === "room" ? preset.room : preset.asset;
                            return (
                              <Button
                                key={preset.label}
                                size="small"
                                variant={Math.round(selected.width) === width ? "contained" : "outlined"}
                                onClick={() => updateSelected({
                                  width: Math.min(100 - selected.x, width),
                                  height: Math.min(100 - selected.y, height),
                                })}
                              >
                                {preset.label}
                              </Button>
                            );
                          })}
                        </Stack>
                      </Box>
                    )}
                    <Box>
                      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>ขนาดตัวอักษร</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(selected.fontSize ?? (selected.type === "label" ? 3.5 : 3)).toFixed(1)}
                        </Typography>
                      </Stack>
                      <Slider
                        aria-label="ขนาดตัวอักษร"
                        min={1.5}
                        max={6}
                        step={0.25}
                        value={selected.fontSize ?? (selected.type === "label" ? 3.5 : 3)}
                        onChange={(_, value) => updateSelected({ fontSize: value as number })}
                        marks={[
                          { value: 1.5, label: "เล็ก" },
                          { value: 3.5, label: "กลาง" },
                          { value: 6, label: "ใหญ่" },
                        ]}
                        sx={{ px: 0.5 }}
                      />
                    </Box>
                    <TextField
                      label="สี"
                      type="color"
                      value={selected.color}
                      onChange={(event) => updateSelected({ color: event.target.value })}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </>
                )}
                {selected.type === "room" && !selected.parentId && (
                  <Button startIcon={<MeetingRoomOutlined />} variant="contained" onClick={() => openRoom(selected.id)}>
                    เปิดผังภายในห้อง
                  </Button>
                )}
                <Button color="error" variant="outlined" startIcon={<DeleteOutlined />} onClick={() => deleteElement(selected)}>
                  ลบออกจากผัง
                </Button>
              </Stack>
            </MainCard>
          )}
        </Stack>
        <MainCard
          title={<Typography variant="h5">{activeRoom ? `ภายในห้อง · ${activeRoom.name}` : "พื้นที่ออกแบบ"}</Typography>}
          subheader={activeRoom ? "เพิ่มชิ้นงาน ข้อความ หรือหมุด QR แล้วลากไปวางในห้อง" : "เริ่มจากเพิ่มกรอบห้อง แล้วลากไปวางในตำแหน่งจริง"}
          action={<Typography variant="caption">{visibleElements.length} องค์ประกอบ</Typography>}
        >
          {activeRoom && (
            <Button startIcon={<ArrowBackOutlined />} onClick={() => { setActiveRoomId(null); setSelectedId(activeRoom.id); }} sx={{ mb: 1.5 }}>
              กลับไปผังชั้น
            </Button>
          )}
          {selected && (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 1.5, p: 1.25, borderRadius: 2, bgcolor: "action.hover", alignItems: { sm: "center" } }}>
              <Typography sx={{ flex: 1, fontWeight: 700 }}>{selected.name}</Typography>
              {selected.type === "room" && !selected.parentId && (
                <Button size="small" startIcon={<MeetingRoomOutlined />} onClick={() => openRoom(selected.id)}>เปิดดูภายใน</Button>
              )}
              <Button size="small" color="error" startIcon={<DeleteOutlined />} onClick={() => deleteElement(selected)}>ลบออกจากผัง</Button>
            </Stack>
          )}
          <Box ref={canvasContainerRef}>
            <FloorPlanCanvas
              editable
              elements={visibleElements}
              backgroundUrl={activeRoom ? null : state.backgroundUrl}
              aspectRatio={state.canvasWidth / state.canvasHeight}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onChange={(elements) => {
                const changed = new Map(elements.map((element) => [element.id, element]));
                setState((current) => ({
                  ...current,
                  elements: current.elements.map((element) => changed.get(element.id) ?? element),
                }));
              }}
            />
          </Box>
          <Alert severity="info" sx={{ mt: 2 }}>
            แผนผังนี้ใช้สำหรับระบุตำแหน่งและบริหารงานซ่อมบำรุง ไม่ใช่แบบก่อสร้างหรือแบบอพยพฉุกเฉิน
          </Alert>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 2, justifyContent: "flex-end" }}>
            <Button startIcon={<DownloadOutlined />} onClick={() => downloadBlob(
              new Blob([JSON.stringify({ format: "isri-facility-map", version: 1, ...state }, null, 2)], { type: "application/json" }),
              `${state.building}-${state.floor}-facility-map.json`,
            )}>ดาวน์โหลดไฟล์สำรอง</Button>
            <Button startIcon={<DownloadOutlined />} onClick={async () => {
              const svg = canvasContainerRef.current?.querySelector("svg");
              if (svg) await exportCanvasAsPng(svg, state);
            }}>ดาวน์โหลด PNG</Button>
            <Button variant="contained" startIcon={<SaveOutlined />} disabled={save.isPending || !state.building.trim() || !state.floor.trim() || !state.name.trim()} onClick={() => save.mutate()}>
              {save.isPending ? "กำลังบันทึก…" : "บันทึกผัง"}
            </Button>
          </Stack>
        </MainCard>
      </Box>
    </Stack>
  );
}
