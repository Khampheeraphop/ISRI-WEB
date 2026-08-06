import { ArrowBackOutlined } from "@mui/icons-material";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
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
type FormValues = {
  code: string;
  building: string;
  floor: string;
  zone: string;
  assetName: string;
};
const fields: FormField<FormValues>[] = [
  {
    name: "code",
    label: "รหัส QR",
    required: true,
    placeholder: "BLD-A-F2-Z03",
  },
  { name: "building", label: "อาคาร", required: true },
  { name: "floor", label: "ชั้น", required: true },
  { name: "zone", label: "โซน", required: true },
  {
    name: "assetName",
    label: "ชื่อชิ้นงาน",
    fullWidth: true,
    placeholder: "เว้นว่างได้ หาก QR เป็นจุดพื้นที่",
  },
];
const schema = yup.object({
  code: yup
    .string()
    .matches(/^BLD-[A-Z]+-F\d+-Z\d+$/i, "รูปแบบ BLD-A-F2-Z03")
    .required(),
  building: yup.string().required(),
  floor: yup.string().required(),
  zone: yup.string().required(),
  assetName: yup.string().default(""),
}) as yup.ObjectSchema<FormValues>;
export function LocationFormPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const locations = useEntityQuery("locations");
  const create = useEntityMutation("locations");
  const update = useEntityUpdateMutation("locations");
  const item =
    id && id !== "new"
      ? (locations.data ?? []).find((x) => x.id === id)
      : undefined;
  if (!locations.isLoading && id && id !== "new" && !item)
    return <Alert severity="warning">ไม่พบตำแหน่ง</Alert>;
  const save = async (v: FormValues) => {
    if (item) await update.mutateAsync({ id: item.id, changes: v });
    else await create.mutateAsync(v);
    nav("/locations");
  };
  return (
    <Stack spacing={3}>
      <Box>
        <Button
          startIcon={<ArrowBackOutlined />}
          onClick={() => nav("/locations")}
          sx={{ mb: 1 }}
        >
          กลับไปรายการตำแหน่ง
        </Button>
        <Typography variant="h3">
          {item ? "แก้ไขตำแหน่ง" : "เพิ่มตำแหน่ง"}
        </Typography>
      </Box>
      <MainCard title={<Typography variant="h5">ข้อมูลตำแหน่ง</Typography>}>
        <GenericForm<FormValues>
          key={item?.id ?? "new"}
          fields={fields}
          schema={schema}
          defaultValues={
            item
              ? {
                  code: item.code,
                  building: item.building,
                  floor: item.floor,
                  zone: item.zone,
                  assetName: item.assetName ?? "",
                }
              : {
                  code: "",
                  building: "",
                  floor: "",
                  zone: "",
                  assetName: "",
                }
          }
          columns={2}
          submitLabel={item ? "บันทึกการแก้ไข" : "เพิ่มตำแหน่ง"}
          onCancel={() => nav("/locations")}
          onSubmit={save}
          isSubmitting={create.isPending || update.isPending}
        />
      </MainCard>
    </Stack>
  );
}
