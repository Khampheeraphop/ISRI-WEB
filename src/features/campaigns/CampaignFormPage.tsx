import { yupResolver } from "@hookform/resolvers/yup";
import {
  AddPhotoAlternateOutlined,
  ArrowBackOutlined,
  CheckCircleOutlined,
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

  const create = useMutation({ mutationFn: createCampaign });
  const update = useMutation({ mutationFn: updateCampaign });
  const isSaving = create.isPending || update.isPending;

  const save = async (values: CampaignForm) => {
    const selectedReward = rewards.data?.find(
      (reward) => reward.id === values.rewardItemId,
    );
    const returnedReservation =
      editing?.rewardItemId === values.rewardItemId
        ? editing.reservedRewardCount
        : 0;
    if (
      !selectedReward ||
      selectedReward.stock + returnedReservation < values.winnerCount
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
    <Stack spacing={3}>
      <Box>
        <Button
          startIcon={<ArrowBackOutlined />}
          onClick={() => navigate("/campaigns/manage")}
          sx={{ mb: 1 }}
        >
          กลับไปรายการแคมเปญ
        </Button>
        <Typography variant="h3">
          {editing ? "แก้ไขแคมเปญ" : "สร้างแคมเปญ"}
        </Typography>
      </Box>

      {feedback && <Alert severity="error">{feedback}</Alert>}
      {rewards.isError && (
        <Alert severity="error">ไม่สามารถโหลดของรางวัลได้</Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(save)} noValidate>
        <Stack spacing={3}>
          <MainCard title={<Typography variant="h5">ข้อมูลแคมเปญ</Typography>}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                },
                gap: 2,
              }}
            >
              <TextField
                {...register("name")}
                label="ชื่อแคมเปญ"
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
                required
                sx={{ gridColumn: "1 / -1" }}
              />
              <TextField
                {...register("periodType")}
                select
                label="ประเภทรอบ"
                error={Boolean(errors.periodType)}
                helperText={errors.periodType?.message}
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
                helperText={errors.winnerCount?.message}
                slotProps={{ htmlInput: { min: 1, max: 100 } }}
                required
              />
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
                slotProps={{
                  inputLabel: { shrink: true },
                  htmlInput: { min: today },
                }}
                required
              />
            </Box>
          </MainCard>

          <MainCard
            title={<Typography variant="h5">เลือกรางวัล</Typography>}
            action={
              <Button
                component={Link}
                to="/rewards/manage/new"
                size="small"
                startIcon={<AddPhotoAlternateOutlined />}
              >
                เพิ่มของรางวัล
              </Button>
            }
          >
            <input type="hidden" {...register("rewardItemId")} />
            {!rewards.data?.length ? (
              <Alert severity="info">กรุณาเพิ่มของรางวัลก่อนสร้างแคมเปญ</Alert>
            ) : (
              <Box
                role="radiogroup"
                aria-label="เลือกรางวัลสำหรับแคมเปญ"
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "repeat(2, minmax(0, 1fr))",
                  },
                  gap: 1.75,
                }}
              >
                {rewards.data.map((reward) => {
                  const isSelected = reward.id === selectedRewardId;
                  const reserved =
                    editing?.rewardItemId === reward.id
                      ? editing.reservedRewardCount
                      : 0;
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
                        minHeight: 148,
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "112px minmax(0, 1fr)",
                          sm: "148px minmax(0, 1fr)",
                        },
                        alignItems: "stretch",
                        textAlign: "left",
                        border: 2,
                        borderColor: isSelected ? "primary.main" : "divider",
                        borderRadius: 2,
                        overflow: "hidden",
                        bgcolor: isSelected
                          ? "action.selected"
                          : "background.paper",
                        opacity: isUnavailable ? 0.5 : 1,
                        transition:
                          "border-color .15s ease, background-color .15s ease, transform .15s ease",
                        "&:hover": {
                          borderColor: isSelected
                            ? "primary.main"
                            : "primary.light",
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          minHeight: 146,
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
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                              p: 1.25,
                            }}
                          />
                        ) : (
                          <Inventory2Outlined
                            color="disabled"
                            sx={{ fontSize: 48 }}
                          />
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
                      <Stack
                        spacing={0.75}
                        sx={{ p: { xs: 1.5, sm: 1.75 }, minWidth: 0 }}
                      >
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
                            minHeight: 38,
                          }}
                        >
                          {reward.description}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={0.75}
                          sx={{ flexWrap: "wrap" }}
                        >
                          <Chip
                            size="small"
                            color={isUnavailable ? "error" : "default"}
                            label={
                              isUnavailable
                                ? `เหลือ ${available} ชิ้น ไม่พอสำหรับผู้ชนะ`
                                : `พร้อมใช้ ${available} ชิ้น`
                            }
                          />
                          {reward.rewardPeriod === "annual" ? (
                            <Chip
                              size="small"
                              color="secondary"
                              label="รางวัลประจำปี"
                            />
                          ) : !reward.isActive ? (
                            <Chip
                              size="small"
                              color="secondary"
                              label="รางวัลแคมเปญ"
                            />
                          ) : (
                            <Chip
                              size="small"
                              color="success"
                              variant="outlined"
                              label="แลกด้วยคะแนน"
                            />
                          )}
                        </Stack>
                      </Stack>
                    </ButtonBase>
                  );
                })}
              </Box>
            )}
            {errors.rewardItemId && (
              <FormHelperText error sx={{ mt: 1 }}>
                {errors.rewardItemId.message}
              </FormHelperText>
            )}
          </MainCard>

          <Stack
            direction="row"
            spacing={1.25}
            sx={{ justifyContent: "flex-end" }}
          >
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
              disabled={isSaving || !rewards.data?.length}
            >
              {editing ? "บันทึกการแก้ไข" : "สร้างแคมเปญ"}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
}
