import {
  ArrowBackOutlined,
  AssignmentIndOutlined,
  DescriptionOutlined,
  LocationOnOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MainCard } from "../../components/base/MainCard";
import { DetailSection } from "../../components/detail/DetailSection";
import { IncidentStatusChip } from "../../components/IncidentStatusChip";
import { formatBangkokDate } from "../../utils/incident";
import {
  assignWorkOrder,
  getDispatchIncidentDetail,
  getDispatchSlaRules,
  getDispatchTechnicians,
  rejectDispatchIncident,
} from "./dispatchApi";

export function DispatchIncidentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const client = useQueryClient();
  const [primaryTechnicianId, setPrimaryTechnicianId] = useState("");
  const [supportTechnicianIds, setSupportTechnicianIds] = useState<string[]>(
    [],
  );
  const [urgencyVerified, setUrgencyVerified] = useState<
    "critical" | "urgent" | "normal"
  >("normal");
  const [rejectionOpen, setRejectionOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const detail = useQuery({
    queryKey: ["dispatch-incident", id],
    queryFn: () => getDispatchIncidentDetail(id ?? ""),
    enabled: Boolean(id),
  });
  const technicians = useQuery({
    queryKey: ["dispatch-technicians"],
    queryFn: getDispatchTechnicians,
  });
  const slaRules = useQuery({
    queryKey: ["dispatch-sla-rules"],
    queryFn: getDispatchSlaRules,
  });
  const assign = useMutation({
    mutationFn: assignWorkOrder,
    onSuccess: async (workOrder) => {
      await client.invalidateQueries({ queryKey: ["dispatch-incidents"] });
      navigate(`/work-orders/${workOrder.id}`, { replace: true });
    },
  });
  const reject = useMutation({
    mutationFn: rejectDispatchIncident,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ["dispatch-incidents"] }),
        client.invalidateQueries({ queryKey: ["notifications"] }),
      ]);
      navigate("/dispatch", { replace: true });
    },
  });

  if (detail.isLoading || technicians.isLoading || slaRules.isLoading) {
    return (
      <Box sx={{ minHeight: 320, display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }
  if (detail.error || !detail.data) {
    return (
      <Alert severity="error">
        {detail.error instanceof Error
          ? detail.error.message
          : "ไม่พบรายการรอจัดสรร"}
      </Alert>
    );
  }

  const incident = detail.data;
  const specialtyForCategory: Record<string, string | undefined> = {
    ไฟฟ้า: "electrical",
    ประปา: "plumbing",
    เครื่องปรับอากาศ: "air_conditioning",
    ลิฟต์: "elevator",
    "โครงสร้าง/พื้นผิวอาคาร (ผนัง พื้น เพดาน ประตู)": "building",
  };
  const specialtyLabels: Record<string, string> = {
    electrical: "ช่างไฟฟ้า",
    plumbing: "ช่างประปา",
    air_conditioning: "ช่างเครื่องปรับอากาศ",
    elevator: "ช่างลิฟต์",
    building: "ช่างโครงสร้างและอาคาร",
  };
  const requiredSpecialty = specialtyForCategory[incident.category];
  const eligibleTechnicians = (technicians.data ?? []).filter(
    (technician) =>
      !requiredSpecialty ||
      technician.technician_specialties.includes(requiredSpecialty),
  );
  const technicianLabel = (technician: (typeof eligibleTechnicians)[number]) =>
    `${technician.full_name} (${
      technician.technician_specialties
        .map((specialty) => specialtyLabels[specialty] ?? specialty)
        .join(", ") || "ยังไม่ได้ระบุความเชี่ยวชาญ"
    })`;
  return (
    <Stack spacing={3}>
      <Box>
        <Button
          component={Link}
          to="/dispatch"
          startIcon={<ArrowBackOutlined />}
          sx={{ mb: 1 }}
        >
          กลับไปคิวรอจัดสรรงาน
        </Button>
        <Typography variant="h3">รายละเอียดรายการแจ้งซ่อม</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          {incident.ticketNumber}
        </Typography>
      </Box>

      <Box>
        <DetailSection
          title="ข้อมูลคำขอ"
          icon={<DescriptionOutlined />}
          fields={[
            {
              label: "เลขที่ใบแจ้ง",
              value: (
                <Typography sx={{ fontWeight: 700 }}>
                  {incident.ticketNumber}
                </Typography>
              ),
            },
            {
              label: "สถานะ",
              value: <IncidentStatusChip status={incident.status} />,
            },
            {
              label: "ประเภทปัญหา",
              value: <Typography>{incident.category}</Typography>,
            },
            {
              label: "การประเมิน SLA",
              value: (
                <Typography>รอผู้จัดสรรงานตรวจสอบและกำหนดระดับ</Typography>
              ),
            },
            {
              label: "วันที่แจ้ง",
              value: (
                <Typography>
                  {formatBangkokDate(incident.createdAt)} น.
                </Typography>
              ),
            },
          ]}
        />
      </Box>

      <DetailSection
        title="รายละเอียดปัญหา"
        icon={<DescriptionOutlined />}
        fields={[
          {
            label: "รายละเอียดที่แจ้ง",
            value: (
              <Typography sx={{ whiteSpace: "pre-wrap" }}>
                {incident.description}
              </Typography>
            ),
            fullWidth: true,
          },
          {
            label: "ภาพประกอบ",
            value: incident.attachments.length ? (
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ flexWrap: "wrap", rowGap: 1.5 }}
              >
                {incident.attachments.map((file) => (
                  <Box
                    key={file.url}
                    component="a"
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    sx={{
                      width: 132,
                      height: 96,
                      overflow: "hidden",
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1.5,
                    }}
                  >
                    <Box
                      component="img"
                      src={file.url}
                      alt={file.fileName}
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography color="text.secondary">ไม่มีภาพประกอบ</Typography>
            ),
            fullWidth: true,
          },
        ]}
      />

      <DetailSection
        title="จุดแจ้งซ่อม"
        icon={<LocationOnOutlined />}
        fields={[
          {
            label: "ตำแหน่ง",
            value: <Typography>{incident.locationLabel}</Typography>,
          },
          {
            label: "ชื่อชิ้นงาน",
            value: (
              <Typography>{incident.assetName || "ไม่ได้ระบุ"}</Typography>
            ),
          },
        ]}
      />

      <MainCard
        title={
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <AssignmentIndOutlined color="primary" />
            <Typography variant="h5">มอบหมายผู้รับผิดชอบ</Typography>
          </Stack>
        }
        subheader="กำหนดช่างหลักและช่างสนับสนุนตามประเภทของใบแจ้งซ่อม"
      >
        <Stack spacing={2}>
          {technicians.error && (
            <Alert severity="error">
              {technicians.error instanceof Error
                ? technicians.error.message
                : "ไม่สามารถโหลดรายชื่อช่างได้"}
            </Alert>
          )}
          <Alert
            severity={requiredSpecialty ? "info" : "warning"}
            sx={{ maxWidth: 720 }}
          >
            {requiredSpecialty
              ? `งานประเภท ${incident.category} เลือกได้เฉพาะ ${specialtyLabels[requiredSpecialty]} เท่านั้น`
              : "งานประเภทอื่น ๆ สามารถเลือกช่างได้ทุกความเชี่ยวชาญ"}
          </Alert>
          <Box sx={{ maxWidth: 720 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.75 }}>
              ช่างหลัก
            </Typography>
            <Select
              fullWidth
              displayEmpty
              value={primaryTechnicianId}
              onChange={(event) => {
                const nextPrimary = event.target.value;
                setPrimaryTechnicianId(nextPrimary);
                setSupportTechnicianIds((current) =>
                  current.filter(
                    (technicianId) => technicianId !== nextPrimary,
                  ),
                );
              }}
            >
              <MenuItem value="" disabled>
                เลือกช่างหลัก
              </MenuItem>
              {eligibleTechnicians.map((technician) => (
                <MenuItem key={technician.id} value={technician.id}>
                  {technicianLabel(technician)}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <Box sx={{ maxWidth: 720 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.75 }}>
              ช่างสนับสนุน{" "}
              <Typography
                component="span"
                variant="caption"
                color="text.secondary"
              >
                (เลือกได้หลายคน)
              </Typography>
            </Typography>
            <Select
              fullWidth
              multiple
              displayEmpty
              value={supportTechnicianIds}
              renderValue={(selected) =>
                selected.length
                  ? selected
                      .map(
                        (id) =>
                          eligibleTechnicians.find(
                            (technician) => technician.id === id,
                          )?.full_name ?? id,
                      )
                      .join(", ")
                  : "ยังไม่เลือกช่างสนับสนุน"
              }
              onChange={(event) =>
                setSupportTechnicianIds(
                  (event.target.value as string[]).filter(
                    (technicianId) => technicianId !== primaryTechnicianId,
                  ),
                )
              }
            >
              {eligibleTechnicians
                .filter((technician) => technician.id !== primaryTechnicianId)
                .map((technician) => (
                  <MenuItem key={technician.id} value={technician.id}>
                    <Checkbox
                      checked={supportTechnicianIds.includes(technician.id)}
                    />
                    <ListItemText primary={technicianLabel(technician)} />
                  </MenuItem>
                ))}
            </Select>
          </Box>
          <Box sx={{ maxWidth: 560 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.75 }}>
              ระดับความเร่งด่วนที่ผู้จัดสรรยืนยัน
            </Typography>
            <Select
              fullWidth
              value={urgencyVerified}
              onChange={(event) =>
                setUrgencyVerified(
                  event.target.value as "critical" | "urgent" | "normal",
                )
              }
            >
              <MenuItem value="critical">วิกฤต</MenuItem>
              <MenuItem value="urgent">เร่งด่วน</MenuItem>
              <MenuItem value="normal">ปกติ</MenuItem>
            </Select>
          </Box>
          {slaRules.error && (
            <Alert severity="error">
              {slaRules.error instanceof Error
                ? slaRules.error.message
                : "ไม่สามารถโหลดกติกา SLA ได้"}
            </Alert>
          )}
          {assign.error && (
            <Alert severity="error">
              {assign.error instanceof Error
                ? assign.error.message
                : "ไม่สามารถมอบหมายงานได้"}
            </Alert>
          )}
          {reject.error && (
            <Alert severity="error">
              {reject.error instanceof Error
                ? reject.error.message
                : "ไม่สามารถบันทึกผลการพิจารณาได้"}
            </Alert>
          )}
          <Stack
            direction="row"
            spacing={1}
            sx={{ justifyContent: "flex-end" }}
          >
            <Button
              color="error"
              variant="outlined"
              disabled={assign.isPending || reject.isPending}
              onClick={() => {
                setRejectionReason("");
                setRejectionOpen(true);
              }}
            >
              ไม่รับรายการ
            </Button>
            <Button
              variant="contained"
              disabled={
                !primaryTechnicianId ||
                assign.isPending ||
                reject.isPending ||
                slaRules.isError ||
                !(slaRules.data ?? []).some(
                  (rule) => rule.urgencyLevel === urgencyVerified,
                )
              }
              onClick={() =>
                assign.mutate({
                  incidentId: incident.id,
                  primaryTechnicianId,
                  supportTechnicianIds,
                  urgencyVerified,
                })
              }
            >
              มอบหมายงาน
            </Button>
          </Stack>
        </Stack>
      </MainCard>
      <Dialog
        open={rejectionOpen}
        onClose={() => !reject.isPending && setRejectionOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>ไม่รับรายการแจ้งซ่อม</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              autoFocus
              fullWidth
              required
              multiline
              minRows={4}
              label="เหตุผลที่ไม่รับรายการ"
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              helperText={`${rejectionReason.trim().length}/2,000 ตัวอักษร (อย่างน้อย 5 ตัวอักษร)`}
              slotProps={{ htmlInput: { maxLength: 2000 } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setRejectionOpen(false)}
            disabled={reject.isPending}
          >
            กลับ
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={rejectionReason.trim().length < 5 || reject.isPending}
            onClick={() =>
              reject.mutate({
                incidentId: incident.id,
                reason: rejectionReason.trim(),
              })
            }
          >
            ยืนยันไม่รับรายการ
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
