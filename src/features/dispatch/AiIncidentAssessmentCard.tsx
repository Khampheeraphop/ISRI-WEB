import {
  AutoAwesomeOutlined,
  CheckCircleOutlined,
  HelpOutlined,
  RefreshOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MainCard } from "../../components/base/MainCard";
import { formatBangkokDate } from "../../utils/incident";
import type { UrgencyLevel } from "../../types/incident";
import {
  createAiIncidentAssessment,
  getLatestAiIncidentAssessment,
  type AiIncidentAssessmentState,
} from "./dispatchApi";

const urgencyDetails: Record<
  UrgencyLevel,
  { label: string; color: "error" | "warning" | "success" }
> = {
  critical: { label: "วิกฤต", color: "error" },
  urgent: { label: "เร่งด่วน", color: "warning" },
  normal: { label: "ปกติ", color: "success" },
};

const hazardLabels: Record<string, string> = {
  smoke_or_fire: "ควันหรือไฟไหม้",
  electrical_sparking: "ประกายไฟ/ไฟฟ้าลัดวงจร",
  water_near_electrical: "น้ำใกล้อุปกรณ์ไฟฟ้า",
  structural_fall_or_collapse: "เสี่ยงหล่นหรือพังถล่ม",
  trapped_person_elevator: "บุคคลอาจติดในลิฟต์",
  active_major_leak: "การรั่วไหลต่อเนื่อง",
  blocked_egress: "ทางสัญจรถูกกีดขวาง",
  critical_area_service_disruption: "ระบบขัดข้องในพื้นที่สำคัญ",
  visible_damage: "ความเสียหายที่มองเห็นได้",
  unclear: "ข้อมูลไม่ชัดเจน",
  none: "ไม่พบสัญญาณอันตราย",
};

interface AiIncidentAssessmentCardProps {
  incidentId: string;
  onUseSuggestedUrgency: (urgency: UrgencyLevel) => void;
}

function TextList({ items }: { items: string[] }) {
  return (
    <Box component="ul" sx={{ my: 0, pl: 2.5 }}>
      {items.map((item, index) => (
        <Typography
          component="li"
          variant="body2"
          key={`${item}-${index}`}
          sx={{ mb: 0.5 }}
        >
          {item}
        </Typography>
      ))}
    </Box>
  );
}

export function AiIncidentAssessmentCard({
  incidentId,
  onUseSuggestedUrgency,
}: AiIncidentAssessmentCardProps) {
  const queryClient = useQueryClient();
  const assessmentQueryKey = ["dispatch-ai-assessment", incidentId] as const;
  const assessment = useQuery({
    queryKey: assessmentQueryKey,
    queryFn: () => getLatestAiIncidentAssessment(incidentId),
  });
  const analyze = useMutation({
    mutationFn: () => createAiIncidentAssessment(incidentId),
    onSuccess: (data) => {
      queryClient.setQueryData<AiIncidentAssessmentState>(
        assessmentQueryKey,
        (current) => ({
          assessment: data,
          configured: current?.configured ?? true,
        }),
      );
    },
  });
  const latestAssessment = assessment.data?.assessment ?? null;
  const isConfigured = assessment.data?.configured !== false;

  return (
    <MainCard
      title={
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <AutoAwesomeOutlined color="primary" />
          <Typography variant="h5">ISRI AI Safety Assistant</Typography>
          <Chip label="ทดลอง" size="small" variant="outlined" color="primary" />
        </Stack>
      }
      subheader="AI ช่วยแยกสัญญาณอันตราย ส่วนกฎ ISRI แนะนำระดับเบื้องต้น ผู้จัดสรรงานเป็นผู้ยืนยันผลสุดท้าย"
    >
      {assessment.isLoading ? (
        <Stack sx={{ alignItems: "center", py: 3 }}>
          <CircularProgress size={28} />
        </Stack>
      ) : assessment.error ? (
        <Alert severity="error">
          {assessment.error instanceof Error
            ? assessment.error.message
            : "ไม่สามารถโหลดผลวิเคราะห์ AI ได้"}
        </Alert>
      ) : !latestAssessment ? (
        <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
          <Alert severity="info" sx={{ width: "100%" }}>
            ระบบจะส่งเฉพาะรายละเอียดเหตุ ตำแหน่ง และภาพประกอบ (ถ้ามี)
            ไปวิเคราะห์ โดยไม่ส่งชื่อหรืออีเมลผู้แจ้ง
          </Alert>
          {!isConfigured && (
            <Alert severity="warning" sx={{ width: "100%" }}>
              ฟีเจอร์ AI ยังไม่พร้อมใช้งาน: กรุณาตั้งค่า GEMINI_API_KEY ใน
              Supabase Edge Function Secrets
            </Alert>
          )}
          {analyze.error && (
            <Alert severity="error" sx={{ width: "100%" }}>
              {analyze.error instanceof Error
                ? analyze.error.message
                : "ไม่สามารถวิเคราะห์เหตุได้"}
            </Alert>
          )}
          <Button
            variant="contained"
            startIcon={
              analyze.isPending ? (
                <CircularProgress color="inherit" size={18} />
              ) : (
                <AutoAwesomeOutlined />
              )
            }
            disabled={analyze.isPending || !isConfigured}
            onClick={() => analyze.mutate()}
          >
            {analyze.isPending ? "กำลังวิเคราะห์…" : "วิเคราะห์ด้วย AI"}
          </Button>
        </Stack>
      ) : (
        <Stack spacing={2.25}>
          <Alert
            severity={latestAssessment.needsHumanReview ? "warning" : "info"}
            icon={
              latestAssessment.needsHumanReview ? (
                <WarningAmberOutlined />
              ) : (
                <CheckCircleOutlined />
              )
            }
          >
            ผลนี้เป็นคำแนะนำ ไม่ใช่การอนุมัติ SLA
            กรุณาตรวจภาพและรายละเอียดต้นฉบับก่อนยืนยันระดับ
          </Alert>
          {!isConfigured && (
            <Alert severity="warning">
              ยังไม่สามารถวิเคราะห์ใหม่ได้จนกว่าจะตั้งค่า GEMINI_API_KEY ใน
              Supabase
            </Alert>
          )}

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            divider={<Divider orientation="vertical" flexItem />}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant="overline" color="text.secondary">
                สรุปโดย AI
              </Typography>
              <Typography sx={{ whiteSpace: "pre-wrap" }}>
                {latestAssessment.summary}
              </Typography>
            </Box>
            <Box sx={{ minWidth: { md: 230 } }}>
              <Typography variant="overline" color="text.secondary">
                ระดับที่กฎ ISRI แนะนำ
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                {latestAssessment.suggestedUrgency ? (
                  <Chip
                    label={
                      urgencyDetails[latestAssessment.suggestedUrgency].label
                    }
                    color={
                      urgencyDetails[latestAssessment.suggestedUrgency].color
                    }
                  />
                ) : (
                  <Chip label="ให้คนตรวจสอบ" color="warning" />
                )}
              </Box>
              <Typography variant="body2" sx={{ mt: 1.25 }}>
                ประเภทที่ AI แนะนำ: {latestAssessment.categorySuggested}
              </Typography>
            </Box>
          </Stack>

          <Box>
            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
              <Typography variant="subtitle2">
                ความมั่นใจที่ AI ประเมินเอง
              </Typography>
              <Typography variant="subtitle2">
                {Math.round(latestAssessment.confidence * 100)}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={latestAssessment.confidence * 100}
              sx={{ mt: 0.75, height: 7, borderRadius: 4 }}
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 0.75 }}>
              สัญญาณที่ตรวจพบ
            </Typography>
            <Stack
              direction="row"
              spacing={0.75}
              useFlexGap
              sx={{ flexWrap: "wrap" }}
            >
              {latestAssessment.detectedHazards.map((hazard) => (
                <Chip
                  key={hazard}
                  label={hazardLabels[hazard] ?? hazard}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Box>

          {latestAssessment.ruleReasons.length > 0 && (
            <Box>
              <Typography variant="subtitle2">เหตุผลจากกฎ ISRI</Typography>
              <TextList items={latestAssessment.ruleReasons} />
            </Box>
          )}
          {latestAssessment.evidence.length > 0 && (
            <Box>
              <Typography variant="subtitle2">หลักฐานจากภาพ/ข้อความ</Typography>
              <TextList items={latestAssessment.evidence} />
            </Box>
          )}
          {latestAssessment.missingInformation.length > 0 && (
            <Box>
              <Stack
                direction="row"
                spacing={0.75}
                sx={{ alignItems: "center" }}
              >
                <HelpOutlined color="warning" fontSize="small" />
                <Typography variant="subtitle2">
                  ข้อมูลที่ควรถามเพิ่ม
                </Typography>
              </Stack>
              <TextList items={latestAssessment.missingInformation} />
            </Box>
          )}

          {analyze.error && (
            <Alert severity="error">
              {analyze.error instanceof Error
                ? analyze.error.message
                : "ไม่สามารถวิเคราะห์เหตุซ้ำได้"}
            </Alert>
          )}
          <Divider />
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{
              justifyContent: "space-between",
              alignItems: { sm: "center" },
            }}
          >
            <Typography variant="caption" color="text.secondary">
              วิเคราะห์เมื่อ {formatBangkokDate(latestAssessment.createdAt)} น.
              · {latestAssessment.model} · ภาพ{" "}
              {latestAssessment.inputAttachmentCount} รูป
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<RefreshOutlined />}
                disabled={analyze.isPending || !isConfigured}
                onClick={() => analyze.mutate()}
              >
                วิเคราะห์ใหม่
              </Button>
              {latestAssessment.suggestedUrgency && (
                <Button
                  variant="contained"
                  onClick={() =>
                    onUseSuggestedUrgency(latestAssessment.suggestedUrgency!)
                  }
                >
                  ใช้ระดับที่แนะนำ
                </Button>
              )}
            </Stack>
          </Stack>
        </Stack>
      )}
    </MainCard>
  );
}
