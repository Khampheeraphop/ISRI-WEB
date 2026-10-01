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
  selectedUrgency,
  selectedTechnicianId,
  onUseUrgency,
  onUseTechnician,
}: {
  incidentId: string;
  selectedUrgency: UrgencyLevel;
  selectedTechnicianId: string;
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
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              color: "primary.main",
              bgcolor: "rgba(78, 57, 155, 0.08)",
            }}
          >
            <AutoAwesomeOutlined fontSize="small" />
          </Box>
          <Typography variant="h5">ผู้ช่วยจัดสรรงาน</Typography>
          <Chip label="AI" size="small" color="primary" />
        </Stack>
      }
      subheader="สรุปข้อมูลสำคัญ พร้อมแนะนำระดับความเร่งด่วนและช่างที่เหมาะสม"
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
            <Button
              color="inherit"
              size="small"
              onClick={() => void advice.refetch()}
            >
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
        <Stack spacing={2.5}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                lg: "minmax(0, 1.35fr) minmax(320px, 0.65fr)",
              },
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                p: 2.25,
                borderRadius: 3,
                border: 1,
                borderColor: "divider",
                bgcolor: "rgba(78, 57, 155, 0.035)",
              }}
            >
              <Typography variant="overline" color="primary.main">
                สรุปเหตุจากข้อมูลในระบบ
              </Typography>
              <Typography sx={{ mt: 0.5, fontSize: "1rem", lineHeight: 1.8 }}>
                {result.summary}
              </Typography>
            </Box>

            <Box
              sx={{
                p: 2.25,
                borderRadius: 3,
                border: 1,
                borderColor: "primary.light",
                bgcolor: "rgba(78, 57, 155, 0.055)",
              }}
            >
              <Typography variant="overline" color="text.secondary">
                ระดับความเร่งด่วนที่แนะนำ
              </Typography>
              <Stack
                direction="row"
                spacing={0.75}
                sx={{ mt: 0.5, mb: 1.25, flexWrap: "wrap", rowGap: 0.75 }}
              >
                <Chip
                  color={urgencyPresentation[result.recommendedUrgency].color}
                  label={urgencyPresentation[result.recommendedUrgency].label}
                  sx={{ fontWeight: 700 }}
                />
                <Chip
                  variant="outlined"
                  label={confidenceLabels[result.confidence]}
                />
              </Stack>
              <Stack spacing={0.5} sx={{ mb: 1.5 }}>
                {result.urgencyReasons.map((reason) => (
                  <Typography key={reason} variant="body2">
                    • {reason}
                  </Typography>
                ))}
              </Stack>
              <Button
                fullWidth
                color={
                  selectedUrgency === result.recommendedUrgency
                    ? "success"
                    : "primary"
                }
                variant="contained"
                startIcon={<CheckCircleOutlined />}
                onClick={() => onUseUrgency(result.recommendedUrgency)}
              >
                {selectedUrgency === result.recommendedUrgency
                  ? "ใช้ระดับนี้แล้ว"
                  : "ใช้ระดับที่แนะนำ"}
              </Button>
            </Box>
          </Box>

          {(result.relatedIncidentCount > 0 ||
            result.repeatInsight ||
            result.missingInformation.length > 0) && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: 1.5,
              }}
            >
              {(result.relatedIncidentCount > 0 || result.repeatInsight) && (
                <Alert severity="warning" sx={{ borderRadius: 3 }}>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: "center", mb: 0.25 }}
                  >
                    <Typography sx={{ fontWeight: 700 }}>
                      พบเหตุคล้ายกันในพื้นที่
                    </Typography>
                    {result.relatedIncidentCount > 0 && (
                      <Chip
                        size="small"
                        label={`${result.relatedIncidentCount} รายการ`}
                      />
                    )}
                  </Stack>
                  <Typography variant="body2">{result.repeatInsight}</Typography>
                </Alert>
              )}

              {!!result.missingInformation.length && (
                <Alert
                  severity="info"
                  icon={<ErrorOutlined />}
                  sx={{ borderRadius: 3 }}
                >
                  <Typography sx={{ fontWeight: 700 }}>
                    ควรตรวจข้อมูลเพิ่มก่อนมอบหมาย
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.25 }}>
                    {result.missingInformation.join(" · ")}
                  </Typography>
                </Alert>
              )}
            </Box>
          )}

          <Box>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={0.5}
              sx={{ mb: 1.25, justifyContent: "space-between" }}
            >
              <Typography sx={{ fontWeight: 700 }}>ช่างที่เหมาะกับงานนี้</Typography>
              <Typography variant="body2" color="text.secondary">
                เรียงตามทักษะที่ตรงกับงานและภาระงานปัจจุบัน
              </Typography>
            </Stack>
            {result.technicianRecommendations.length ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: 1.25,
                }}
              >
                {result.technicianRecommendations.map((technician) => {
                  const isSelected =
                    technician.technicianId === selectedTechnicianId;
                  return (
                    <Box
                      key={technician.technicianId}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                        p: 2,
                        border: isSelected ? 2 : 1,
                        borderColor: isSelected ? "success.main" : "divider",
                        borderRadius: 3,
                        bgcolor: isSelected
                          ? "rgba(46, 125, 50, 0.055)"
                          : "background.paper",
                        boxShadow: isSelected
                          ? "0 10px 28px rgba(46, 125, 50, 0.10)"
                          : "0 6px 20px rgba(35, 26, 80, 0.045)",
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1.25}
                        sx={{ alignItems: "center" }}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            flexShrink: 0,
                            borderRadius: 2,
                            display: "grid",
                            placeItems: "center",
                            color: "primary.main",
                            bgcolor: "rgba(78, 57, 155, 0.08)",
                          }}
                        >
                          <EngineeringOutlined fontSize="small" />
                        </Box>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography sx={{ fontWeight: 700 }} noWrap>
                            {technician.fullName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            รับผิดชอบอยู่ {technician.activeWorkOrders} งาน
                          </Typography>
                        </Box>
                        {isSelected && (
                          <Chip
                            size="small"
                            color="success"
                            label="เลือกแล้ว"
                          />
                        )}
                      </Stack>
                      <Stack
                        direction="row"
                        spacing={0.75}
                        sx={{ flexWrap: "wrap", rowGap: 0.75 }}
                      >
                        {technician.specialties.slice(0, 2).map((specialty) => (
                          <Chip
                            key={specialty}
                            size="small"
                            variant="outlined"
                            label={specialtyLabels[specialty] ?? specialty}
                          />
                        ))}
                        {technician.specialties.length > 2 && (
                          <Chip
                            size="small"
                            variant="outlined"
                            label={`+${technician.specialties.length - 2} ทักษะ`}
                          />
                        )}
                      </Stack>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ flex: 1, lineHeight: 1.7 }}
                      >
                        {technician.reason}
                      </Typography>
                      <Button
                        fullWidth
                        size="small"
                        color={isSelected ? "success" : "primary"}
                        variant={isSelected ? "contained" : "outlined"}
                        startIcon={
                          isSelected ? <CheckCircleOutlined /> : undefined
                        }
                        aria-pressed={isSelected}
                        onClick={() => onUseTechnician(technician.technicianId)}
                      >
                        {isSelected
                          ? "เลือกเป็นช่างหลักแล้ว"
                          : "เลือกเป็นช่างหลัก"}
                      </Button>
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Alert severity="warning">
                ยังไม่มีช่างที่ตรงเงื่อนไข
                กรุณาตรวจรายชื่อและความเชี่ยวชาญด้วยตนเอง
              </Alert>
            )}
          </Box>

          <Box
            sx={{
              pt: 1.5,
              borderTop: 1,
              borderColor: "divider",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              วิเคราะห์เมื่อ {formatBangkokDate(result.generatedAt)} น. ·
              ไม่ได้วิเคราะห์ภาพประกอบ ·
              ระบบจะยังไม่บันทึกการมอบหมายจนกว่าผู้จัดสรรจะกดยืนยัน
            </Typography>
          </Box>
        </Stack>
      )}
    </MainCard>
  );
}
