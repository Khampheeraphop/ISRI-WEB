import { MapOutlined, OpenInNewOutlined } from "@mui/icons-material";
import { Alert, Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { MainCard } from "../../components/base/MainCard";
import { getManagedLocations } from "../admin/locationsApi";
import { FloorPlanCanvas } from "./FloorPlanCanvas";
import { getFloorPlans } from "./facilityMapsApi";

export function LocationMapPreview({ locationId }: { locationId: string }) {
  const locations = useQuery({ queryKey: ["managed-locations"], queryFn: getManagedLocations });
  const plans = useQuery({ queryKey: ["floor-plans"], queryFn: getFloorPlans });
  if (locations.isLoading || plans.isLoading) {
    return <Box sx={{ minHeight: 180, display: "grid", placeItems: "center" }}><CircularProgress size={28} /></Box>;
  }
  const location = locations.data?.find((item) => item.id === locationId);
  const plan = location
    ? plans.data?.find((item) => item.building === location.building && item.floor === location.floor)
    : undefined;
  const hasMarker = plan?.elements.some((element) => element.locationId === locationId);
  if (!plan || !hasMarker) return null;
  const marker = plan.elements.find((element) => element.locationId === locationId);
  const activeRoom = marker?.parentId
    ? plan.elements.find((element) => element.id === marker.parentId)
    : undefined;
  const visibleElements = plan.elements.filter(
    (element) => (element.parentId ?? null) === (marker?.parentId ?? null),
  );
  return (
    <MainCard
      title={
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <MapOutlined color="primary" />
          <Typography variant="h5">ตำแหน่งบนแผนผัง</Typography>
        </Stack>
      }
      subheader={`${plan.building} · ${plan.floor}${activeRoom ? ` · ${activeRoom.name}` : ""}`}
      action={
        <Button
          component={Link}
          to={`/facility-maps?plan=${plan.id}&location=${locationId}`}
          endIcon={<OpenInNewOutlined />}
        >
          เปิดผังเต็ม
        </Button>
      }
    >
      <FloorPlanCanvas
        elements={visibleElements}
        backgroundUrl={activeRoom ? null : plan.backgroundUrl}
        aspectRatio={plan.canvasWidth / plan.canvasHeight}
        highlightedLocationId={locationId}
      />
      <Alert severity="info" sx={{ mt: 1.5 }}>
        จุดสีแดงคือตำแหน่งของรายการนี้บนแผนผัง
      </Alert>
    </MainCard>
  );
}
