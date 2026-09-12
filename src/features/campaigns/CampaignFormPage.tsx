import { yupResolver } from "@hookform/resolvers/yup";
import {
  AddPhotoAlternateOutlined,
  ArrowBackOutlined,
  CalendarMonthOutlined,
  CampaignOutlined,
  CardGiftcardOutlined,
  CheckCircleOutlined,
  GroupsOutlined,
  Inventory2Outlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Chip,
  CircularProgress,
  FormHelperText,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { MainCard } from "../../components/base/MainCard";
import type {
  CampaignPeriodType,
  CreateRewardCampaign,
} from "../../types/reward";
import { getAdminRewards } from "../rewards/rewardsApi";
import { createCampaign, getCampaigns, updateCampaign } from "./campaignApi";

type CampaignForm = CreateRewardCampaign;

function todayInBangkok() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  return `${value.year}-${value.month}-${value.day}`;
}

function endOfMonth(date: string) {
  const [year, month] = date.split("-").map(Number);
  const day = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return `${year}-${String(month).padStart(2, "0")}-${day}`;
}

export function CampaignFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const today = useMemo(todayInBangkok, []);
  const campaigns = useQuery({
    queryKey: ["campaigns"],
    queryFn: getCampaigns,
  });
  const rewards = useQuery({
    queryKey: ["admin-rewards"],
    queryFn: getAdminRewards,
  });
  const editing =
    id && id !== "new"
      ? (campaigns.data ?? []).find((item) => item.id === id)
      : undefined;
  const startIsLocked = Boolean(editing && editing.startDate <= today);
  const [feedback, setFeedback] = useState<string>();

  const schema = useMemo(
    () =>
      yup.object({
        name: yup
          .string()
          .trim()
          .min(2)
          .max(200)
          .required("กรุณาระบุชื่อแคมเปญ"),
        periodType: yup
          .mixed<CampaignPeriodType>()
          .oneOf(["monthly", "yearly", "custom"])
          .required(),
        startDate: yup
          .string()
          .required("กรุณาระบุวันเริ่ม")
          .test("not-past", "ไม่สามารถกำหนดวันเริ่มย้อนหลังได้", (value) =>
            Boolean(value && (startIsLocked || value >= today)),
          ),
        endDate: yup
          .string()
          .required("กรุณาระบุวันสิ้นสุด")
          .test(
            "after-start",
            "วันสิ้นสุดต้องไม่น้อยกว่าวันเริ่ม",
            function (value) {
              return Boolean(
                value &&
                this.parent.startDate &&
                value >= this.parent.startDate,
              );
            },
          )
          .test("not-past", "ไม่สามารถกำหนดวันสิ้นสุดย้อนหลังได้", (value) =>
            Boolean(value && value >= today),
          ),
        rewardItemId: yup.string().uuid().required("กรุณาเลือกของรางวัล"),
        winnerCount: yup
          .number()
          .integer("จำนวนผู้ชนะต้องเป็นจำนวนเต็ม")
          .min(1, "ต้องมีผู้ชนะอย่างน้อย 1 คน")
          .max(100, "กำหนดผู้ชนะได้สูงสุด 100 คน")
          .required("กรุณาระบุจำนวนผู้ชนะ"),
      }) as yup.ObjectSchema<CampaignForm>,
    [startIsLocked, today],
  );

  const defaults = useMemo<CampaignForm>(() => {
    if (editing) {
      return {
        name: editing.name,
        periodType: editing.periodType,
        startDate: editing.startDate,
        endDate: editing.endDate,
        rewardItemId: editing.rewardItemId ?? "",
        winnerCount: editing.winnerCount,
      };
    }
    return {
      name: "",
      periodType: "monthly",
      startDate: today,
      endDate: endOfMonth(today),
      rewardItemId: "",
      winnerCount: 1,
    };
  }, [editing, today]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CampaignForm>({
    values: defaults,
    resolver: yupResolver(schema) as Resolver<CampaignForm>,
    mode: "onTouched",
  });
  const selectedRewardId = watch("rewardItemId");
  const winnerCount = Number(watch("winnerCount")) || 1;
  const campaignRewards = useMemo(
    () =>
      (rewards.data ?? []).filter(
        (reward) => !reward.isActive && reward.rewardPeriod === "standard",
      ),
    [rewards.data],
  );
  const selectedReward = campaignRewards.find(
    (reward) => reward.id === selectedRewardId,
  );

  const create = useMutation({ mutationFn: createCampaign });
  const update = useMutation({ mutationFn: updateCampaign });
  const isSaving = create.isPending || update.isPending;

  const save = async (values: CampaignForm) => {
    const selectedCampaignReward = campaignRewards.find(
      (reward) => reward.id === values.rewardItemId,
    );
    const returnedReservation =
      editing?.rewardItemId === values.rewardItemId
        ? editing.reservedRewardCount
        : 0;
    if (
      !selectedCampaignReward ||
      selectedCampaignReward.stock + returnedReservation < values.winnerCount
    ) {
      setFeedback("ของรางวัลคงเหลือไม่เพียงพอสำหรับจำนวนผู้ชนะ");
      return;
    }
    try {
      setFeedback(undefined);
      if (editing) await update.mutateAsync({ id: editing.id, ...values });
      else await create.mutateAsync(values);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["campaigns"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-rewards"] }),
      ]);
      navigate("/campaigns/manage");
    } catch (cause) {
      setFeedback(
        cause instanceof Error ? cause.message : "ไม่สามารถบันทึกแคมเปญได้",
      );
    }
  };

  if (campaigns.isLoading || rewards.isLoading) {
    return (
      <Box sx={{ minHeight: 320, display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }
  if (id && id !== "new" && !editing) {
    return <Alert severity="warning">ไม่พบแคมเปญที่ต้องการแก้ไข</Alert>;
  }

  return (
    <Stack spacing={2.5} sx={{ maxWidth: 1440, mx: "auto" }}>
      <MainCard contentSx={{ p: 0 }} sx={{ overflow: "hidden" }}>
        <Box
          sx={{
            px: { xs: 2.25, md: 3.25 },
            py: { xs: 2.25, md: 2.75 },
            display: "flex",
            gap: 2,
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            background:
              "linear-gradient(118deg, rgba(75,59,134,0.11) 0%, rgba(156,121,223,0.05) 58%, rgba(255,255,255,0) 100%)",
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                flexShrink: 0,
                display: "grid",
                placeItems: "center",
                borderRadius: 2,
                color: "common.white",
                bgcolor: "primary.main",
                boxShadow: "0 8px 18px rgba(75,59,134,0.22)",
              }}
            >
              <CampaignOutlined />
            </Box>
            <Box>
              <Typography variant="h3">
                {editing ? "แก้ไขแคมเปญ" : "สร้างแคมเปญ"}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.15 }}>
                กำหนดช่วงเวลา จำนวนผู้ชนะ และรางวัลสำหรับแคมเปญ
              </Typography>
            </Box>
          </Stack>
          <Button
            startIcon={<ArrowBackOutlined />}
            onClick={() => navigate("/campaigns/manage")}
            sx={{ flexShrink: 0 }}
          >
            กลับไปรายการแคมเปญ
          </Button>
        </Box>
      </MainCard>

      {feedback && <Alert severity="error">{feedback}</Alert>}
      {rewards.isError && <Alert severity="error">ไม่สามารถโหลดของรางวัลได้</Alert>}

      <Box component="form" onSubmit={handleSubmit(save)} noValidate>
        <Stack spacing={2.5}>
          <MainCard
            title={
              <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: "50%",
                    color: "common.white",
                    bgcolor: "primary.main",
                    fontWeight: 700,
                  }}
                >
                  1
                </Box>
                <Box>
                  <Typography variant="h5">ข้อมูลแคมเปญ</Typography>
                  <Typography variant="body2" color="text.secondary">
                    ระบุชื่อ รูปแบบรอบ และช่วงเวลาที่เปิดรับคะแนน
                  </Typography>
                </Box>
              </Stack>
            }
            contentSx={{ p: { xs: 2.25, md: 3 } }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                gap: 2,
              }}
            >
              <TextField
                {...register("name")}
                label="ชื่อแคมเปญ"
                placeholder="เช่น ร่วมแจ้ง ร่วมสร้างความปลอดภัย ประจำเดือนกันยายน"
                error={Boolean(errors.name)}
                helperText={errors.name?.message ?? "ชื่อที่สื่อถึงเป้าหมายและช่วงเวลาของแคมเปญ"}
                required
                sx={{ gridColumn: "1 / -1" }}
              />
              <TextField
                {...register("periodType")}
                select
                label="ประเภทรอบ"
                error={Boolean(errors.periodType)}
                helperText={errors.periodType?.message ?? "ใช้สำหรับจัดกลุ่มและแสดงผลแคมเปญ"}
                required
              >
                <MenuItem value="monthly">รายเดือน</MenuItem>
                <MenuItem value="yearly">รายปี</MenuItem>
                <MenuItem value="custom">กำหนดช่วงเวลา</MenuItem>
              </TextField>
              <TextField
                {...register("winnerCount", { valueAsNumber: true })}
                type="number"
                label="จำนวนผู้ชนะ"
                error={Boolean(errors.winnerCount)}
                helperText={errors.winnerCount?.message ?? "ระบบจะสำรองรางวัลตามจำนวนนี้"}
                slotProps={{ htmlInput: { min: 1, max: 100 } }}
                required
              />
              <Box
                sx={{
                  gridColumn: "1 / -1",
                  p: { xs: 1.5, md: 2 },
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                  gap: 2,
                  borderRadius: 2,
                  bgcolor: "rgba(75,59,134,0.035)",
                  border: 1,
                  borderColor: "divider",
                }}
              >
                <Stack direction="row" spacing={1} sx={{ gridColumn: "1 / -1", alignItems: "center" }}>
                  <CalendarMonthOutlined color="primary" />
                  <Typography sx={{ fontWeight: 700 }}>ช่วงเวลาแคมเปญ</Typography>
                </Stack>
                <TextField
                  {...register("startDate")}
                  type="date"
                  label="วันเริ่ม"
                  error={Boolean(errors.startDate)}
                  helperText={errors.startDate?.message}
                  slotProps={{
                    inputLabel: { shrink: true },
                    htmlInput: { min: today, readOnly: startIsLocked },
                  }}
                  required
                />
                <TextField
                  {...register("endDate")}
                  type="date"
                  label="วันสิ้นสุด"
                  error={Boolean(errors.endDate)}
                  helperText={errors.endDate?.message}
                  slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: today } }}
                  required
                />
              </Box>
            </Box>
          </MainCard>

          <MainCard
            title={
              <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: "50%",
                    color: "common.white",
                    bgcolor: "primary.main",
                    fontWeight: 700,
                  }}
                >
                  2
                </Box>
                <Box>
                  <Typography variant="h5">เลือกรางวัลแคมเปญ</Typography>
                  <Typography variant="body2" color="text.secondary">
                    แสดงเฉพาะรางวัลประเภท “รางวัลแคมเปญเท่านั้น”
                  </Typography>
                </Box>
              </Stack>
            }
            action={
              <Button
                component={Link}
                to="/rewards/manage/new"
                size="small"
                startIcon={<AddPhotoAlternateOutlined />}
              >
                เพิ่มรางวัลแคมเปญ
              </Button>
            }
            contentSx={{ p: { xs: 2.25, md: 3 } }}
          >
            <input type="hidden" {...register("rewardItemId")} />
            {!campaignRewards.length ? (
              <Box
                sx={{
                  py: 4,
                  px: 2,
                  display: "grid",
                  placeItems: "center",
                  textAlign: "center",
                  border: "1px dashed",
                  borderColor: "divider",
                  borderRadius: 2,
                  bgcolor: "rgba(75,59,134,0.025)",
                }}
              >
                <CardGiftcardOutlined sx={{ fontSize: 44, color: "primary.light" }} />
                <Typography variant="h6" sx={{ mt: 1 }}>
                  ยังไม่มีรางวัลสำหรับแคมเปญ
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5, mb: 1.5 }}>
                  เพิ่มของรางวัลและเลือกประเภท “รางวัลแคมเปญเท่านั้น” ก่อนสร้างแคมเปญ
                </Typography>
                <Button component={Link} to="/rewards/manage/new" variant="outlined">
                  เพิ่มรางวัลแคมเปญ
                </Button>
              </Box>
            ) : (
              <Box
                role="radiogroup"
                aria-label="เลือกรางวัลสำหรับแคมเปญ"
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
                  gap: 1.75,
                }}
              >
                {campaignRewards.map((reward) => {
                  const isSelected = reward.id === selectedRewardId;
                  const reserved = editing?.rewardItemId === reward.id ? editing.reservedRewardCount : 0;
                  const available = reward.stock + reserved;
                  const isUnavailable = available < winnerCount;
                  return (
                    <ButtonBase
                      key={reward.id}
                      role="radio"
                      aria-checked={isSelected}
                      disabled={isUnavailable}
                      onClick={() =>
                        setValue("rewardItemId", reward.id, {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        })
                      }
                      sx={{
                        width: "100%",
                        minHeight: 164,
                        display: "grid",
                        gridTemplateColumns: { xs: "108px minmax(0, 1fr)", sm: "150px minmax(0, 1fr)" },
                        alignItems: "stretch",
                        textAlign: "left",
                        border: 2,
                        borderColor: isSelected ? "primary.main" : "divider",
                        borderRadius: 2.25,
                        overflow: "hidden",
                        bgcolor: isSelected ? "rgba(75,59,134,0.055)" : "background.paper",
                        boxShadow: isSelected ? "0 10px 24px rgba(75,59,134,0.12)" : "none",
                        opacity: isUnavailable ? 0.5 : 1,
                        transition: "border-color .15s ease, background-color .15s ease, transform .15s ease, box-shadow .15s ease",
                        "&:hover": {
                          borderColor: isSelected ? "primary.main" : "primary.light",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          minHeight: 162,
                          display: "grid",
                          placeItems: "center",
                          bgcolor: "#F7F7FA",
                          position: "relative",
                          borderRight: 1,
                          borderColor: "divider",
                        }}
                      >
                        {reward.imageUrl ? (
                          <Box
                            component="img"
                            src={reward.imageUrl}
                            alt={reward.name}
                            sx={{ width: "100%", height: "100%", objectFit: "contain", p: 1.25 }}
                          />
                        ) : (
                          <Inventory2Outlined color="disabled" sx={{ fontSize: 48 }} />
                        )}
                        {isSelected && (
                          <CheckCircleOutlined
                            color="primary"
                            sx={{
                              position: "absolute",
                              top: 10,
                              right: 10,
                              bgcolor: "background.paper",
                              borderRadius: "50%",
                            }}
                          />
                        )}
                      </Box>
                      <Stack spacing={0.75} sx={{ p: { xs: 1.5, sm: 1.75 }, minWidth: 0 }}>
                        <Chip
                          size="small"
                          color="secondary"
                          label="รางวัลแคมเปญ"
                          sx={{ alignSelf: "flex-start" }}
                        />
                        <Typography sx={{ fontWeight: 700, lineHeight: 1.35 }}>
                          {reward.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {reward.description}
                        </Typography>
                        <Chip
                          size="small"
                          icon={<Inventory2Outlined />}
                          color={isUnavailable ? "error" : "default"}
                          label={
                            isUnavailable
                              ? `คงเหลือ ${available} ชิ้น — ไม่พอสำหรับผู้ชนะ`
                              : `พร้อมใช้ ${available} ชิ้น`
                          }
                          sx={{ alignSelf: "flex-start", mt: "auto !important" }}
                        />
                      </Stack>
                    </ButtonBase>
                  );
                })}
              </Box>
            )}
            {errors.rewardItemId && (
              <FormHelperText error sx={{ mt: 1.25 }}>
                {errors.rewardItemId.message}
              </FormHelperText>
            )}
          </MainCard>

          <Box
            sx={{
              position: "sticky",
              bottom: 16,
              zIndex: 2,
              p: 1.5,
              display: "flex",
              gap: 2,
              alignItems: { xs: "stretch", sm: "center" },
              justifyContent: "space-between",
              flexDirection: { xs: "column", sm: "row" },
              border: 1,
              borderColor: "divider",
              borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.94)",
              boxShadow: "0 12px 30px rgba(35,27,58,0.12)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 0 }}>
              {selectedReward ? (
                <>
                  <CardGiftcardOutlined color="primary" />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" color="text.secondary">
                      รางวัลที่เลือก · สำรอง {winnerCount} ชิ้น
                    </Typography>
                    <Typography noWrap sx={{ fontWeight: 700 }}>
                      {selectedReward.name}
                    </Typography>
                  </Box>
                </>
              ) : (
                <>
                  <GroupsOutlined color="disabled" />
                  <Typography color="text.secondary">กรอกข้อมูลและเลือกรางวัลเพื่อดำเนินการต่อ</Typography>
                </>
              )}
            </Stack>
            <Stack direction="row" spacing={1.25} sx={{ justifyContent: "flex-end" }}>
              <Button
                type="button"
                variant="outlined"
                color="inherit"
                onClick={() => navigate("/campaigns/manage")}
              >
                ยกเลิก
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSaving || !campaignRewards.length}
              >
                {editing ? "บันทึกการแก้ไข" : "สร้างแคมเปญ"}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
}
