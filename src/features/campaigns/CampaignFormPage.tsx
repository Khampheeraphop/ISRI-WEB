import { ArrowBackOutlined } from "@mui/icons-material";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { MainCard } from "../../components/base/MainCard";
import { GenericForm } from "../../components/form/GenericForm";
import type { FormField } from "../../components/form/types";
import type { CampaignPeriodType } from "../../types/reward";
import { createCampaign, getCampaigns, updateCampaign } from "./campaignApi";

type CampaignForm = {
  name: string;
  periodType: CampaignPeriodType;
  startDate: string;
  endDate: string;
  prizeDescription: string;
};

const fields: FormField<CampaignForm>[] = [
  { name: "name", label: "ชื่อแคมเปญ", required: true, fullWidth: true },
  {
    name: "periodType",
    label: "ประเภทรอบ",
    type: "select",
    required: true,
    options: [
      { label: "รายเดือน", value: "monthly" },
      { label: "รายปี", value: "yearly" },
      { label: "กำหนดช่วงเวลา", value: "custom" },
    ],
  },
  { name: "startDate", label: "วันเริ่ม", type: "date", required: true },
  { name: "endDate", label: "วันสิ้นสุด", type: "date", required: true },
  {
    name: "prizeDescription",
    label: "รางวัลสำหรับผู้ชนะ",
    type: "textarea",
    required: true,
    fullWidth: true,
  },
];

const schema = yup.object({
  name: yup.string().trim().required("กรุณาระบุชื่อแคมเปญ"),
  periodType: yup
    .mixed<CampaignPeriodType>()
    .oneOf(["monthly", "yearly", "custom"])
    .required(),
  startDate: yup.string().required("กรุณาระบุวันเริ่ม"),
  endDate: yup
    .string()
    .required("กรุณาระบุวันสิ้นสุด")
    .test("after-start", "วันสิ้นสุดต้องไม่น้อยกว่าวันเริ่ม", function (value) {
      return !value || !this.parent.startDate || value >= this.parent.startDate;
    }),
  prizeDescription: yup.string().trim().required("กรุณาระบุรางวัล"),
}) as yup.ObjectSchema<CampaignForm>;

export function CampaignFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const campaigns = useQuery({ queryKey: ["campaigns"], queryFn: getCampaigns });
  const create = useMutation({
    mutationFn: createCampaign,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["campaigns"] }),
  });
  const update = useMutation({
    mutationFn: updateCampaign,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["campaigns"] }),
  });
  const [feedback, setFeedback] = useState<string>();
  const editing =
    id && id !== "new"
      ? (campaigns.data ?? []).find((item) => item.id === id)
      : undefined;
  const defaults = useMemo<CampaignForm>(
    () =>
      editing
        ? {
            name: editing.name,
            periodType: editing.periodType,
            startDate: editing.startDate,
            endDate: editing.endDate,
            prizeDescription: editing.prizeDescription,
          }
        : {
            name: "",
            periodType: "monthly",
            startDate: new Date().toISOString().slice(0, 10),
            endDate: new Date().toISOString().slice(0, 10),
            prizeDescription: "",
          },
    [editing],
  );

  if (!campaigns.isLoading && id && id !== "new" && !editing)
    return <Alert severity="warning">ไม่พบแคมเปญที่ต้องการแก้ไข</Alert>;

  const save = async (values: CampaignForm) => {
    try {
      if (editing)
        await update.mutateAsync({
          id: editing.id,
          ...values,
        });
      else await create.mutateAsync(values);
      navigate("/campaigns/manage");
    } catch {
      setFeedback("ไม่สามารถบันทึกแคมเปญได้");
    }
  };

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
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          คะแนนของแคมเปญจะแยกจากกระเป๋าแต้มถาวร
        </Typography>
      </Box>
      {feedback && <Alert severity="error">{feedback}</Alert>}
      <MainCard
        title={<Typography variant="h5">ข้อมูลแคมเปญ</Typography>}
        contentSx={{ p: { xs: 2.5, md: 3.5 } }}
      >
        <GenericForm<CampaignForm>
          key={editing?.id ?? "new-campaign"}
          fields={fields}
          schema={schema}
          defaultValues={defaults}
          columns={2}
          submitLabel={editing ? "บันทึกการแก้ไข" : "สร้างแคมเปญ"}
          onCancel={() => navigate("/campaigns/manage")}
          onSubmit={save}
          isSubmitting={create.isPending || update.isPending}
        />
      </MainCard>
    </Stack>
  );
}
