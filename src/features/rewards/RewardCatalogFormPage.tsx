import { ArrowBackOutlined } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { MainCard } from "../../components/base/MainCard";
import { GenericForm } from "../../components/form/GenericForm";
import type { FormField } from "../../components/form/types";
import {
  createReward,
  getAdminRewards,
  updateReward,
  type RewardInput,
} from "./rewardsApi";
type FormValues = {
  name: string;
  description: string;
  pointCost: number;
  stock: number;
  usage: "redeem" | "campaign" | "annual";
  image: File[];
};
const fields: FormField<FormValues>[] = [
  { name: "name", label: "ชื่อของรางวัล", required: true },
  {
    name: "usage",
    label: "ประเภทของรางวัล",
    type: "select",
    required: true,
    description: "กำหนดว่ารางวัลจะแสดงและนำไปใช้ส่วนใดของระบบ",
    options: [
      { label: "แลกด้วยคะแนน", value: "redeem" },
      { label: "รางวัลแคมเปญเท่านั้น", value: "campaign" },
      { label: "รางวัลประจำปี", value: "annual" },
    ],
  },
  {
    name: "pointCost",
    label: "คะแนนที่ใช้แลก",
    type: "number",
    required: true,
    visibleWhen: (values) => values.usage === "redeem",
  },
  {
    name: "stock",
    label: "จำนวนคงเหลือ",
    type: "number",
    min: 0,
    required: true,
  },
  {
    name: "description",
    label: "รายละเอียด",
    type: "textarea",
    required: true,
    fullWidth: true,
  },
  {
    name: "image",
    label: "รูปของรางวัล",
    type: "file",
    maxFiles: 1,
    required: true,
    fullWidth: true,
  },
];
const makeSchema = (requireImage: boolean) =>
  yup.object({
    name: yup.string().trim().min(2).max(200).required(),
    description: yup.string().trim().min(2).max(2000).required(),
    pointCost: yup.number().integer().min(1).required(),
    stock: yup.number().integer().min(0).required(),
    usage: yup
      .mixed<"redeem" | "campaign" | "annual">()
      .oneOf(["redeem", "campaign", "annual"])
      .required(),
    image: requireImage
      ? yup.array().min(1, "กรุณาแนบรูปของรางวัล").required()
      : yup.array().default([]),
  }) as yup.ObjectSchema<FormValues>;
export function RewardCatalogFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const client = useQueryClient();
  const rewards = useQuery({
    queryKey: ["admin-rewards"],
    queryFn: getAdminRewards,
  });
  const editing =
    id && id !== "new"
      ? rewards.data?.find((item) => item.id === id)
      : undefined;
  const save = useMutation({
    mutationFn: (values: FormValues) => {
      const input: RewardInput = {
        name: values.name,
        description: values.description,
        pointCost: Number(values.pointCost),
        stock: Number(values.stock),
        isActive: values.usage === "redeem" || values.usage === "annual",
        rewardPeriod: values.usage === "annual" ? "annual" : "standard",
        image: values.image[0],
      };
      return editing
        ? updateReward({ id: editing.id, ...input })
        : createReward(input);
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["admin-rewards"] });
      navigate("/rewards/manage");
    },
  });
  const defaults = useMemo<FormValues>(
    () =>
      editing
        ? {
            name: editing.name,
            description: editing.description,
            pointCost: editing.pointCost,
            stock: editing.stock,
            usage:
              editing.rewardPeriod === "annual"
                ? "annual"
                : editing.isActive
                  ? "redeem"
                  : "campaign",
            image: [],
          }
        : {
            name: "",
            description: "",
            pointCost: 20,
            stock: 1,
            usage: "redeem",
            image: [],
          },
    [editing],
  );
  if (rewards.isLoading)
    return (
      <Box sx={{ minHeight: 320, display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  if (id && id !== "new" && !editing)
    return <Alert severity="warning">ไม่พบของรางวัลที่ต้องการแก้ไข</Alert>;
  return (
    <Stack spacing={3}>
      <Box>
        <Button
          startIcon={<ArrowBackOutlined />}
          onClick={() => navigate("/rewards/manage")}
          sx={{ mb: 1 }}
        >
          กลับไปรายการรางวัล
        </Button>
        <Typography variant="h3">
          {editing ? "แก้ไขของรางวัล" : "เพิ่มของรางวัล"}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          กำหนดข้อมูล รูปภาพ และประเภทการใช้งานของรางวัล
        </Typography>
      </Box>
      {save.isError && (
        <Alert severity="error">
          {save.error instanceof Error
            ? save.error.message
            : "ไม่สามารถบันทึกของรางวัลได้"}
        </Alert>
      )}
      <MainCard title={<Typography variant="h5">ข้อมูลของรางวัล</Typography>}>
        {editing?.imageUrl && (
          <Stack spacing={1} sx={{ mb: 3 }}>
            <Typography sx={{ fontWeight: 700 }}>รูปปัจจุบัน</Typography>
            <Box
              component="img"
              src={editing.imageUrl}
              alt={editing.name}
              sx={{
                width: "100%",
                maxWidth: 360,
                height: 220,
                objectFit: "contain",
                bgcolor: "#F7F7FA",
                p: 1,
                borderRadius: 1.5,
                border: 1,
                borderColor: "divider",
              }}
            />
          </Stack>
        )}

        <GenericForm<FormValues>
          key={editing?.id ?? "new"}
          fields={fields.map((field) =>
            field.name === "image" && editing
              ? {
                  ...field,
                  label: "เปลี่ยนรูปของรางวัล (ไม่บังคับ)",
                  required: false,
                }
              : field,
          )}
          schema={makeSchema(!editing)}
          defaultValues={defaults}
          columns={2}
          submitLabel={editing ? "บันทึกการแก้ไข" : "เพิ่มของรางวัล"}
          onCancel={() => navigate("/rewards/manage")}
          onSubmit={(values) => save.mutate(values)}
          isSubmitting={save.isPending}
        />
      </MainCard>
    </Stack>
  );
}
