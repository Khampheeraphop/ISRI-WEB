import {
  AddOutlined,
  ArrowBackOutlined,
  EditOutlined,
  MapOutlined,
  PlaceOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MainCard } from "../../components/base/MainCard";
import { useAuth } from "../../hooks/useAuth";
import { getManagedLocations } from "../admin/locationsApi";
import { FloorPlanCanvas } from "./FloorPlanCanvas";
import { getFloorPlans } from "./facilityMapsApi";

export function FacilityMapPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const plans = useQuery({ queryKey: ["floor-plans"], queryFn: getFloorPlans });
  const locations = useQuery({
    queryKey: ["managed-locations"],
    queryFn: getManagedLocations,
  });
  const requestedPlanId = searchParams.get("plan");
  const [selectedPlanId, setSelectedPlanId] = useState(requestedPlanId ?? "");
  const [highlightedLocationId, setHighlightedLocationId] = useState<
    string | null
  >(searchParams.get("location"));
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  useEffect(() => {
    if (selectedPlanId || !plans.data?.length) return;
    setSelectedPlanId(plans.data[0].id);
  }, [plans.data, selectedPlanId]);
  const selectedPlan = plans.data?.find((plan) => plan.id === selectedPlanId);
  const activeRoom = selectedPlan?.elements.find((element) => element.id === activeRoomId);
  const visibleElements = selectedPlan?.elements.filter(
    (element) => (element.parentId ?? null) === activeRoomId,
  ) ?? [];
  const linkedElements = useMemo(
    () => selectedPlan?.elements.filter((element) => element.locationId) ?? [],
    [selectedPlan],
  );
  const locationsById = useMemo(
    () => new Map((locations.data ?? []).map((location) => [location.id, location])),
    [locations.data],
  );
  useEffect(() => {
    if (!highlightedLocationId || !selectedPlan) return;
    const marker = selectedPlan.elements.find(
      (element) => element.locationId === highlightedLocationId,
    );
    setActiveRoomId(marker?.parentId ?? null);
  }, [highlightedLocationId, selectedPlan]);

  if (plans.isLoading) {
    return (
      <Box sx={{ minHeight: 360, display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }
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
          <Typography variant="h3">แผนผังสถานที่</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            ดูตำแหน่งห้อง จุด QR และชิ้นงานที่เกี่ยวข้องกับงานซ่อมบำรุง
          </Typography>
        </Box>
        {user?.role === "admin" && (
          <Button
            component={Link}
            to="/facility-maps/new/edit"
            variant="contained"
            startIcon={<AddOutlined />}
          >
            สร้างแผนผัง
          </Button>
        )}
      </Box>
      {plans.error && <Alert severity="error">{plans.error.message}</Alert>}
      {!plans.data?.length ? (
        <MainCard title={<Typography variant="h5">ยังไม่มีแผนผัง</Typography>}>
          <Typography color="text.secondary">
            {user?.role === "admin"
              ? "เริ่มจากพื้นที่ว่างหรืออัปโหลดรูปผัง แล้ววางห้องและจุด QR ลงบนผัง"
              : "ผู้ดูแลระบบยังไม่ได้เผยแพร่แผนผังสถานที่"}
          </Typography>
        </MainCard>
      ) : (
        <>
          <MainCard>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ alignItems: { sm: "center" } }}
            >
              <MapOutlined color="primary" />
              <Select
                size="small"
                value={selectedPlanId}
                onChange={(event) => {
                  setSelectedPlanId(event.target.value);
                  setHighlightedLocationId(null);
                  setActiveRoomId(null);
                  setSearchParams({ plan: event.target.value });
                }}
                sx={{ minWidth: 320 }}
              >
                {plans.data.map((plan) => (
                  <MenuItem key={plan.id} value={plan.id}>
                    {plan.building} · {plan.floor} — {plan.name}
                  </MenuItem>
                ))}
              </Select>
              {selectedPlan && (
                <Chip
                  size="small"
                  color={selectedPlan.isPublished ? "success" : "default"}
                  label={
                    selectedPlan.isPublished
                      ? `เผยแพร่แล้ว · v${selectedPlan.version}`
                      : `ฉบับร่าง · v${selectedPlan.version}`
                  }
                />
              )}
              {user?.role === "admin" && selectedPlan && (
                <Button
                  component={Link}
                  to={`/facility-maps/${selectedPlan.id}/edit`}
                  startIcon={<EditOutlined />}
                  sx={{ ml: { sm: "auto !important" } }}
                >
                  แก้ไขผัง
                </Button>
              )}
            </Stack>
          </MainCard>
          {selectedPlan && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 300px" },
                gap: 2,
              }}
            >
              <MainCard
                title={
                  <Typography variant="h5">
                    {activeRoom ? `ภายในห้อง · ${activeRoom.name}` : `${selectedPlan.building} · ${selectedPlan.floor}`}
                  </Typography>
                }
                subheader={activeRoom ? "กดจุดในห้องเพื่อดูตำแหน่งงาน" : "กดห้องเพื่อเปิดดูภายใน หรือกดจุดบนผังเพื่อดูตำแหน่งงาน"}
              >
                {activeRoom && (
                  <Button startIcon={<ArrowBackOutlined />} onClick={() => { setActiveRoomId(null); setHighlightedLocationId(null); }} sx={{ mb: 1.5 }}>
                    กลับไปผังชั้น
                  </Button>
                )}
                <FloorPlanCanvas
                  elements={visibleElements}
                  backgroundUrl={activeRoom ? null : selectedPlan.backgroundUrl}
                  aspectRatio={
                    selectedPlan.canvasWidth / selectedPlan.canvasHeight
                  }
                  highlightedLocationId={highlightedLocationId}
                  onSelect={(elementId) => {
                    const element = selectedPlan.elements.find(
                      (item) => item.id === elementId,
                    );
                    if (element?.type === "room" && !element.parentId) {
                      setActiveRoomId(element.id);
                      setHighlightedLocationId(null);
                      return;
                    }
                    const next = element?.locationId ?? null;
                    setHighlightedLocationId(next);
                    setSearchParams(
                      next
                        ? { plan: selectedPlan.id, location: next }
                        : { plan: selectedPlan.id },
                    );
                  }}
                />
              </MainCard>
              <MainCard
                title={<Typography variant="h6">จุด QR ที่เชื่อมกับผัง</Typography>}
                subheader="กดรายการเพื่อค้นหาหมุดบนแผนผัง"
                contentSx={{ p: "0 !important" }}
              >
                {linkedElements.length ? (
                  <List disablePadding>
                    {linkedElements.map((element) => {
                      const location = locationsById.get(element.locationId ?? "");
                      return (
                      <ListItemButton
                        key={element.id}
                        selected={element.locationId === highlightedLocationId}
                        onClick={() => {
                          setActiveRoomId(element.parentId ?? null);
                          setHighlightedLocationId(element.locationId);
                          if (element.locationId)
                            setSearchParams({
                              plan: selectedPlan.id,
                              location: element.locationId,
                            });
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 42 }}>
                          <PlaceOutlined
                            sx={{ color: element.type === "asset" ? "#d97706" : "#1976d2" }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>{element.name}</Typography>
                              <Chip
                                size="small"
                                color={element.type === "asset" ? "warning" : "info"}
                                label={element.type === "asset" ? "QR ชิ้นงาน" : "QR พื้นที่/ห้อง"}
                              />
                            </Stack>
                          }
                          secondary={
                            `${location?.code ?? "ไม่พบรหัส QR"} · ${
                              element.parentId
                                ? `อยู่ภายใน ${selectedPlan.elements.find((item) => item.id === element.parentId)?.name ?? "ห้อง"}`
                                : `อยู่บนผัง ${selectedPlan.floor}`
                            }`
                          }
                        />
                      </ListItemButton>
                      );
                    })}
                  </List>
                ) : (
                  <Typography color="text.secondary" sx={{ p: 2.5 }}>
                    ยังไม่มีจุด QR เชื่อมกับผังนี้
                  </Typography>
                )}
              </MainCard>
            </Box>
          )}
        </>
      )}
    </Stack>
  );
}
