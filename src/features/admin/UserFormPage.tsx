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
import type { Role } from "../../types/user";
type FormValues = { name: string; role: Role };
const fields: FormField<FormValues>[] = [
  { name: "name", label: "ชื่อ–นามสกุล", required: true },
  {
    name: "role",
    label: "บทบาท",
    type: "select",
    required: true,
    options: [
      { value: "reporter", label: "ผู้แจ้งเหตุ" },
      { value: "technician", label: "ช่างซ่อมบำรุง" },
      { value: "admin", label: "ผู้ดูแลระบบ" },
    ],
  },
];
const schema = yup.object({
  name: yup.string().trim().required(),
  role: yup.mixed<Role>().oneOf(["reporter", "technician", "admin"]).required(),
}) as yup.ObjectSchema<FormValues>;
export function UserFormPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const users = useEntityQuery("users");
  const create = useEntityMutation("users");
  const update = useEntityUpdateMutation("users");
  const user =
    id && id !== "new"
      ? (users.data ?? []).find((x) => x.id === id)
      : undefined;
  if (!users.isLoading && id && id !== "new" && !user)
    return <Alert severity="warning">ไม่พบผู้ใช้</Alert>;
  const save = async (v: FormValues) => {
    if (user) await update.mutateAsync({ id: user.id, changes: v });
    else await create.mutateAsync(v);
    nav("/users");
  };
  return (
    <Stack spacing={3}>
      <Box>
        <Button
          startIcon={<ArrowBackOutlined />}
          onClick={() => nav("/users")}
          sx={{ mb: 1 }}
        >
          กลับไปรายการผู้ใช้
        </Button>
        <Typography variant="h3">
          {user ? "แก้ไขผู้ใช้" : "เพิ่มผู้ใช้"}
        </Typography>
      </Box>
      <MainCard title={<Typography variant="h5">ข้อมูลผู้ใช้</Typography>}>
        <GenericForm<FormValues>
          key={user?.id ?? "new"}
          fields={fields}
          schema={schema}
          defaultValues={
            user
              ? { name: user.name, role: user.role }
              : { name: "", role: "reporter" }
          }
          columns={2}
          submitLabel={user ? "บันทึกการแก้ไข" : "เพิ่มผู้ใช้"}
          onCancel={() => nav("/users")}
          onSubmit={save}
          isSubmitting={create.isPending || update.isPending}
        />
      </MainCard>
    </Stack>
  );
}
