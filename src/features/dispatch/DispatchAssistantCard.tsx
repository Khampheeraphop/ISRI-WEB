import {
  AutoAwesomeOutlined,
  CheckCircleOutlined,
  EngineeringOutlined,
  ErrorOutlined,
  ReplayOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { MainCard } from "../../components/base/MainCard";
import { urgencyPresentation } from "../../utils/incident";
import type { UrgencyLevel } from "../../types/incident";
import { formatBangkokDate, specialtyLabels } from "./dispatchAssistantUi";
import { getDispatchAdvice } from "./dispatchApi";

const confidenceLabels = {
  low: "ข้อมูลยังไม่พอ",
  medium: "ความมั่นใจปานกลาง",
  high: "ความมั่นใจสูง",
};

export function DispatchAssistantCard({
  incidentId,
  onUseUrgency,
  onUseTechnician,
}: {
  incidentId: string;
  onUseUrgency: (urgency: UrgencyLevel) => void;
  onUseTechnician: (technicianId: string) => void;
}) {
  const advice = useQuery({
    queryKey: ["dispatch-ai-advice", incidentId],
    queryFn: ({ signal }) => getDispatchAdvice(incidentId, signal),
    enabled: Boolean(incidentId),
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const result = advice.data;
  return (
    <MainCard
      title={
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <AutoAwesomeOutlined color="primary" />
          <Typography variant="h5">AI ช่วยพิจารณารายการ</Typography>
        </Stack>
      }
      subheader="สรุปเหตุ แนะนำระดับความเร่งด่วน และช่างที่เหมาะสมจากข้อมูลในระบบ"
      action={
        result ? (
          <Button
            size="small"
            startIcon={<ReplayOutlined />}
            disabled={advice.isFetching}
            onClick={() => void advice.refetch()}
          >
            วิเคราะห์ใหม่
          </Button>
        ) : undefined
      }
    >
      {advice.isPending && (
        <Stack
          role="status"
          direction="row"
          spacing={1.5}
          sx={{ alignItems: "center", py: 2 }}
        >
          <CircularProgress size={22} />
          <Box>
            <Typography sx={{ fontWeight: 600 }}>
              กำลังวิเคราะห์รายการและภาระงานช่าง…
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ผู้จัดสรรยังเลือกค่าด้วยตนเองได้ตามปกติ
            </Typography>
          </Box>
        </Stack>
      )}
      {advice.isError && (
        <Alert
          severity="info"
          action={
            <Button color="inherit" size="small" onClick={() => void advice.refetch()}>
              ลองใหม่
            </Button>
          }
        >
          {advice.error instanceof Error
            ? advice.error.message
            : "ไม่สามารถวิเคราะห์รายการนี้ได้"}
          <Typography variant="caption" component="div" sx={{ mt: 0.5 }}>
            คุณยังพิจารณาระดับและเลือกช่างเองได้ตามปกติ
          </Typography>
        </Alert>
      )}
      {result && (
        <Stack spacing={2.25}>
          <Box>
            <Typography variant="overline" color="text.secondary">
              เกิดอะไรขึ้น
            </Typography>
            <Typography sx={{ lineHeight: 1.75 }}>{result.summary}</Typography>
          </Box>

          <Divider />
          <Box>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{ alignItems: { sm: "center" }, mb: 1.25 }}
            >
              <Typography sx={{ fontWeight: 700 }}>ระดับที่แนะนำ</Typography>
              <Chip
                size="small"
                color={urgencyPresentation[result.recommendedUrgency].color}
                label={urgencyPresentation[result.recommendedUrgency].label}
              />
              <Chip
                size="small"
                variant="outlined"
                label={confidenceLabels[result.confidence]}
              />
              <Button
                size="small"
                startIcon={<CheckCircleOutlined />}
                onClick={() => onUseUrgency(result.recommendedUrgency)}
                sx={{ ml: { sm: "auto !important" } }}
              >
                ใช้ระดับนี้
              </Button>
            </Stack>
            <Stack component="ul" spacing={0.5} sx={{ pl: 2.5, my: 0 }}>
              {result.urgencyReasons.map((reason) => (
                <Typography component="li" key={reason} variant="body2">
                  {reason}
                </Typography>
              ))}
            </Stack>
          </Box>

          {(result.relatedIncidentCount > 0 || result.repeatInsight) && (
            <Alert severity={result.relatedIncidentCount > 0 ? "warning" : "info"}>
              <Typography sx={{ fontWeight: 600 }}>
                ประวัติเหตุที่อาจเกี่ยวข้อง
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.25 }}>
                {result.repeatInsight}
              </Typography>
            </Alert>
          )}

          {!!result.missingInformation.length && (
            <Box
              sx={{
                display: "flex",
                gap: 1,
                p: 1.5,
                borderRadius: 2,
                bgcolor: "action.hover",
              }}
            >
              <ErrorOutlined color="action" fontSize="small" />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  ข้อมูลที่ควรตรวจเพิ่ม
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {result.missingInformation.join(" · ")}
                </Typography>
              </Box>
            </Box>
          )}

          <Box>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>
              ช่างที่แนะนำ
            </Typography>
            {result.technicianRecommendations.length ? (
              <Stack spacing={1}>
                {result.technicianRecommendations.map((technician) => (
                  <Box
                    key={technician.technicianId}
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: 1.25,
                      alignItems: { sm: "center" },
                      p: 1.5,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 2,
                    }}
                  >
                    <EngineeringOutlined color="primary" />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700 }}>
                        {technician.fullName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {technician.specialties
                          .map((specialty) => specialtyLabels[specialty] ?? specialty)
                          .join(", ")} · งานที่กำลังรับผิดชอบ {technician.activeWorkOrders} งาน
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {technician.reason}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => onUseTechnician(technician.technicianId)}
                    >
                      เลือกเป็นช่างหลัก
                    </Button>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Alert severity="warning">
                ยังไม่มีช่างที่ตรงเงื่อนไข กรุณาตรวจรายชื่อและความเชี่ยวชาญด้วยตนเอง
              </Alert>
            )}
          </Box>

          <Typography variant="caption" color="text.secondary">
            วิเคราะห์เมื่อ {formatBangkokDate(result.generatedAt)} น. · ไม่ได้วิเคราะห์ภาพประกอบ
            · คำแนะนำนี้ยังไม่เปลี่ยนข้อมูลจนกว่าผู้จัดสรรจะกดยืนยัน
          </Typography>
        </Stack>
      )}
    </MainCard>
  );
}
