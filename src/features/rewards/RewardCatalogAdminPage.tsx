import {
  DeleteOutlined,
  EditOutlined,
  Inventory2Outlined,
} from "@mui/icons-material";
import { Alert, Box, Chip, IconButton, Stack, Typography } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { useState } from "react";
import * as yup from "yup";
import { GenericDataTable } from "../../components/GenericDataTable";
import { MainCard } from "../../components/base/MainCard";
import { GenericForm } from "../../components/form/GenericForm";
import type { FormField } from "../../components/form/types";
import {
  useEntityDeleteMutation,
  useEntityMutation,
  useEntityQuery,
  useEntityUpdateMutation,
} from "../../hooks/useEntity";
import type { RewardItem } from "../../types/reward";

type RewardItemForm = {
  name: string;
  description: string;
  pointCost: number;
  stock: number;
  isActive: "true" | "false";
};

const defaultValues: RewardItemForm = {
  name: "",
  description: "",
  pointCost: 20,
  stock: 1,
  isActive: "true",
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
];

const schema: yup.ObjectSchema<RewardItemForm> = yup.object({
  name: yup.string().trim().required("กรุณาระบุชื่อของรางวัล"),
  description: yup.string().trim().required("กรุณาระบุรายละเอียด"),
  pointCost: yup
    .number()
    .typeError("กรุณาระบุเป็นตัวเลข")
    .integer()
    .min(1, "ต้องมากกว่า 0")
    .required(),
  stock: yup
    .number()
    .typeError("กรุณาระบุเป็นตัวเลข")
    .integer()
    .min(0, "ต้องไม่น้อยกว่า 0")
    .required(),
  isActive: yup.mixed<"true" | "false">().oneOf(["true", "false"]).required(),
});

export function RewardCatalogAdminPage() {
  const rewards = useEntityQuery("rewardItems");
  const createReward = useEntityMutation("rewardItems");
  const updateReward = useEntityUpdateMutation("rewardItems");
  const deleteReward = useEntityDeleteMutation("rewardItems");
  const [editing, setEditing] = useState<RewardItem>();
  const [formVersion, setFormVersion] = useState(0);
  const [feedback, setFeedback] = useState<{
    severity: "success" | "error";
    message: string;
  }>();

  const formValues: RewardItemForm = editing
    ? {
        name: editing.name,
        description: editing.description,
        pointCost: editing.pointCost,
        stock: editing.stock,
        isActive: String(editing.isActive) as RewardItemForm["isActive"],
      }
    : defaultValues;

  const columns: GridColDef<RewardItem>[] = [
    { field: "name", headerName: "ของรางวัล", minWidth: 210, flex: 1 },
    { field: "pointCost", headerName: "แต้ม", minWidth: 90, type: "number" },
    { field: "stock", headerName: "คงเหลือ", minWidth: 95, type: "number" },
    {
      field: "isActive",
      headerName: "สถานะ",
      minWidth: 125,
      renderCell: ({ row }) => (
        <Chip
          size="small"
          color={row.isActive ? "success" : "default"}
          variant="outlined"
          label={row.isActive ? "เปิดให้แลก" : "ปิดการแลก"}
        />
      ),
    },
    {
      field: "actions",
      headerName: "",
      width: 105,
      sortable: false,
      renderCell: ({ row }) => (
        <Stack direction="row">
          <IconButton
            aria-label={"แก้ไข " + row.name}
            onClick={() => setEditing(row)}
          >
            <EditOutlined fontSize="small" />
          </IconButton>
          <IconButton
            aria-label={"ลบ " + row.name}
            color="error"
            onClick={() => {
              if (window.confirm("ลบของรางวัล “" + row.name + "” ใช่หรือไม่"))
                deleteReward.mutate(row.id, {
                  onSuccess: () =>
                    setFeedback({
                      severity: "success",
                      message: "ลบของรางวัลแล้ว",
                    }),
                  onError: () =>
                    setFeedback({
                      severity: "error",
                      message: "ไม่สามารถลบของรางวัลได้",
                    }),
                });
            }}
          >
            <DeleteOutlined fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const saveReward = async (values: RewardItemForm) => {
    const changes = {
      name: values.name,
      description: values.description,
      pointCost: Number(values.pointCost),
      stock: Number(values.stock),
      isActive: values.isActive === "true",
    };
    try {
      if (editing) {
        await updateReward.mutateAsync({ id: editing.id, changes });
        setFeedback({
          severity: "success",
          message: "บันทึกการแก้ไขของรางวัลแล้ว",
        });
      } else {
        await createReward.mutateAsync(changes);
        setFeedback({ severity: "success", message: "เพิ่มของรางวัลแล้ว" });
      }
      setEditing(undefined);
      setFormVersion((version) => version + 1);
    } catch {
      setFeedback({
        severity: "error",
        message: "ไม่สามารถบันทึกของรางวัลได้",
      });
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3">จัดการของรางวัล</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          เพิ่ม แก้ไข เปิดหรือปิดการแลก และกำหนดจำนวนคงเหลือของรางวัล
        </Typography>
      </Box>
      {feedback && (
        <Alert
          severity={feedback.severity}
          onClose={() => setFeedback(undefined)}
        >
          {feedback.message}
        </Alert>
      )}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            xl: "minmax(0, 1.3fr) minmax(340px, 0.7fr)",
          },
          gap: 3,
          alignItems: "start",
        }}
      >
        <MainCard
          title={
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Inventory2Outlined color="primary" />
              <Typography variant="h5">แคตตาล็อกรางวัล</Typography>
            </Stack>
          }
        >
          <GenericDataTable
            rows={rewards.data ?? []}
            columns={columns}
            loading={rewards.isLoading}
            emptyMessage="ยังไม่มีของรางวัล"
          />
        </MainCard>
        <MainCard
          title={
            <Typography variant="h5">
              {editing ? "แก้ไขของรางวัล" : "เพิ่มของรางวัล"}
            </Typography>
          }
          subheader="ข้อมูลนี้จะแสดงในหน้ารางวัลของผู้แจ้งเหตุ"
          contentSx={{ p: { xs: 2.5, md: 3 } }}
        >
          <GenericForm<RewardItemForm>
            key={editing?.id ?? "create-reward-" + formVersion}
            fields={fields}
            schema={schema}
            defaultValues={formValues}
            columns={2}
            submitLabel={editing ? "บันทึกการแก้ไข" : "เพิ่มของรางวัล"}
            cancelLabel="ยกเลิก"
            onCancel={editing ? () => setEditing(undefined) : undefined}
            onSubmit={saveReward}
            isSubmitting={createReward.isPending || updateReward.isPending}
          />
        </MainCard>
      </Box>
    </Stack>
  );
}
