import { ArrowBackOutlined, ImageOutlined } from "@mui/icons-material";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { MainCard } from "../../components/base/MainCard";
import { GenericForm } from "../../components/form/GenericForm";
import type { FormField } from "../../components/form/types";
import {
  useEntityMutation,
  useEntityQuery,
  useEntityUpdateMutation,
} from "../../hooks/useEntity";

type RewardItemForm = {
  name: string;
  description: string;
  pointCost: number;
  stock: number;
  isActive: "true" | "false";
  rewardPeriod: "standard" | "annual";
  image: File[];
};
const fields: FormField<RewardItemForm>[] = [
  { name: "name", label: "ชื่อของรางวัล", required: true },
  {
    name: "pointCost",
    label: "คะแนนที่ใช้แลก",
    type: "number",
    required: true,
  },
  {
    name: "description",
    label: "รายละเอียด",
    type: "textarea",
    required: true,
    fullWidth: true,
  },
  { name: "stock", label: "จำนวนคงเหลือ", type: "number", required: true },
  {
    name: "isActive",
    label: "สถานะ",
    type: "select",
    required: true,
    options: [
      { label: "เปิดให้แลก", value: "true" },
      { label: "ปิดการแลก", value: "false" },
    ],
  },
  {
    name: "rewardPeriod",
    label: "รอบรางวัล",
    type: "select",
    required: true,
    options: [
      { label: "รางวัลทั่วไป", value: "standard" },
      { label: "รางวัลประจำปี", value: "annual" },
    ],
  },
  {
    name: "image",
    label: "รูปของรางวัล",
    type: "file",
    required: true,
    fullWidth: true,
  },
];
const makeSchema = (requiredImage: boolean) =>
  yup.object({
    name: yup.string().trim().required("กรุณาระบุชื่อของรางวัล"),
    description: yup.string().trim().required("กรุณาระบุรายละเอียด"),
    pointCost: yup
      .number()
      .typeError("กรุณาระบุเป็นตัวเลข")
      .integer()
      .min(1)
      .required(),
    stock: yup
      .number()
      .typeError("กรุณาระบุเป็นตัวเลข")
      .integer()
      .min(0)
      .required(),
    isActive: yup.mixed<"true" | "false">().oneOf(["true", "false"]).required(),
    rewardPeriod: yup
      .mixed<"standard" | "annual">()
      .oneOf(["standard", "annual"])
      .required(),
    image: requiredImage
      ? yup.array().min(1, "กรุณาแนบรูปของรางวัล").required()
      : yup.array().default([]),
  }) as yup.ObjectSchema<RewardItemForm>;

export function RewardCatalogFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const rewards = useEntityQuery("rewardItems");
  const storages = useEntityQuery("fileStorages");
  const createReward = useEntityMutation("rewardItems");
  const updateReward = useEntityUpdateMutation("rewardItems");
  const createStorage = useEntityMutation("fileStorages");
  const [feedback, setFeedback] = useState<string>();
  const editing =
    id && id !== "new"
      ? (rewards.data ?? []).find((item) => item.id === id)
      : undefined;
  const currentImage = (storages.data ?? []).find(
    (item) => item.id === editing?.imageFileStorageId,
  );
  const defaults = useMemo<RewardItemForm>(
    () =>
      editing
        ? {
            name: editing.name,
            description: editing.description,
            pointCost: editing.pointCost,
            stock: editing.stock,
            isActive: String(editing.isActive) as "true" | "false",
            rewardPeriod: editing.rewardPeriod,
            image: [],
          }
        : {
            name: "",
            description: "",
            pointCost: 20,
            stock: 1,
            isActive: "true",
            rewardPeriod: "standard",
            image: [],
          },
    [editing],
  );

  if (!rewards.isLoading && id && id !== "new" && !editing)
    return <Alert severity="warning">ไม่พบของรางวัลที่ต้องการแก้ไข</Alert>;
  const save = async (values: RewardItemForm) => {
    try {
      let imageFileStorageId = editing?.imageFileStorageId;
      const image = values.image[0];
      if (image) {
        const stored = await createStorage.mutateAsync({
          fileName: image.name,
          mimeType: image.type,
          sizeBytes: image.size,
          publicUrl: URL.createObjectURL(image),
          uploadedAt: new Date().toISOString(),
        });
        imageFileStorageId = stored.id;
      }
      const changes = {
        name: values.name,
        description: values.description,
        pointCost: Number(values.pointCost),
        stock: Number(values.stock),
        isActive: values.isActive === "true",
        rewardPeriod: values.rewardPeriod,
        imageFileStorageId,
      };
      if (editing) await updateReward.mutateAsync({ id: editing.id, changes });
      else await createReward.mutateAsync(changes);
      navigate("/rewards/manage");
    } catch {
      setFeedback("ไม่สามารถบันทึกของรางวัลได้");
    }
  };

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
          รูปจะถูกอ้างอิงผ่าน FileStorage เพื่อเตรียมต่อ API และฐานข้อมูล
        </Typography>
      </Box>
      {feedback && <Alert severity="error">{feedback}</Alert>}
      <MainCard
        title={<Typography variant="h5">ข้อมูลของรางวัล</Typography>}
        contentSx={{ p: { xs: 2.5, md: 3.5 } }}
      >
        {currentImage && (
          <Box
            component="img"
            src={currentImage.publicUrl}
            alt={editing?.name}
            sx={{
              display: "block",
              width: 180,
              height: 180,
              objectFit: "cover",
              borderRadius: 1.5,
              border: 1,
              borderColor: "divider",
              mb: 3,
            }}
          />
        )}
        {!currentImage && editing && (
          <Stack
            direction="row"
            spacing={1}
            color="text.secondary"
            sx={{ mb: 3, alignItems: "center" }}
          >
            <ImageOutlined />
            <Typography>ยังไม่มีรูปของรางวัล</Typography>
          </Stack>
        )}
        <GenericForm<RewardItemForm>
          key={editing?.id ?? "new-reward"}
          fields={fields.map((field) =>
            field.name === "image" && editing
              ? { ...field, required: false }
              : field,
          )}
          schema={makeSchema(!editing)}
          defaultValues={defaults}
          columns={2}
          submitLabel={editing ? "บันทึกการแก้ไข" : "เพิ่มของรางวัล"}
          cancelLabel="ยกเลิก"
          onCancel={() => navigate("/rewards/manage")}
          onSubmit={save}
          isSubmitting={
            createReward.isPending ||
            updateReward.isPending ||
            createStorage.isPending
          }
        />
      </MainCard>
    </Stack>
  );
}
