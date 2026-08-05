import {
  PeopleAltOutlined,
  RuleOutlined,
  ViewQuiltOutlined,
} from "@mui/icons-material";
import { Alert, Box, Chip, Paper, Stack, Typography } from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import * as yup from "yup";
import { GenericDataTable } from "../components/GenericDataTable";
import { GenericForm, type FormField } from "../components/GenericForm";
import { useEntityMutation, useEntityQuery } from "../hooks/useEntity";
import type { Role, User } from "../types/user";

type NewUser = { name: string; role: Role };
const roleLabels: Record<Role, string> = {
  reporter: "ผู้แจ้งเหตุ",
  technician: "ช่างซ่อมบำรุง",
  admin: "ผู้ดูแลระบบ",
};
const userFields: FormField<NewUser>[] = [
  { name: "name", label: "ชื่อ–นามสกุล", placeholder: "เช่น คุณสมชาย ใจดี" },
  {
    name: "role",
    label: "บทบาท",
    type: "select",
    options: Object.entries(roleLabels).map(([value, label]) => ({
      value,
      label,
    })),
  },
];
const userSchema: yup.ObjectSchema<NewUser> = yup.object({
  name: yup.string().trim().required("กรุณาระบุชื่อ–นามสกุล"),
  role: yup
    .mixed<Role>()
    .oneOf(["reporter", "technician", "admin"])
    .required("กรุณาเลือกบทบาท"),
});
const columns: GridColDef<User>[] = [
  { field: "id", headerName: "รหัส", width: 120 },
  { field: "name", headerName: "ชื่อ–นามสกุล", flex: 1, minWidth: 200 },
  {
    field: "role",
    headerName: "บทบาท",
    width: 150,
    renderCell: ({ value }) => (
      <Chip
        size="small"
        label={roleLabels[value as Role]}
        variant="outlined"
        color="primary"
      />
    ),
  },
];
const foundationItems = [
  [
    <ViewQuiltOutlined />,
    "โครงสร้างกลาง",
    "Theme, routing และ layout พร้อมใช้",
  ],
  [
    <RuleOutlined />,
    "ข้อมูลจำลอง",
    "React Query จัดการ cache และ loading state",
  ],
  [
    <PeopleAltOutlined />,
    "สิทธิ์ตามบทบาท",
    "เปลี่ยน role เพื่อดูเมนูที่เกี่ยวข้อง",
  ],
];

export function DashboardPage() {
  const users = useEntityQuery("users");
  const createUser = useEntityMutation("users");
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3">ศูนย์ควบคุมระบบ</Typography>
        <Typography color="text.secondary">
          Foundation ของ ISRI — โครงสร้างพร้อมสำหรับต่อยอดทุกโมดูล
        </Typography>
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          gap: 2,
        }}
      >
        {foundationItems.map(([icon, title, detail]) => (
          <Paper key={String(title)} sx={{ p: 2.5 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <Box color="primary.main">{icon}</Box>
              <Box>
                <Typography variant="h6">{title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {detail}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        ))}
      </Box>
      <Alert severity="info" variant="outlined">
        ส่วนนี้เป็นการทดสอบ reusable foundation: สร้างผู้ใช้ด้วย GenericForm
        แล้วตารางด้านล่างจะ refresh ผ่าน useEntityMutation โดยอัตโนมัติ
      </Alert>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "minmax(0, 1.7fr) minmax(280px, 0.8fr)",
          },
          gap: 3,
          alignItems: "start",
        }}
      >
        <Paper sx={{ overflow: "hidden" }}>
          <Box sx={{ p: 2.5, borderBottom: 1, borderColor: "divider" }}>
            <Typography variant="h5">ผู้ใช้ตัวอย่าง</Typography>
            <Typography variant="body2" color="text.secondary">
              GenericDataTable + useEntityQuery
            </Typography>
          </Box>
          <GenericDataTable
            rows={users.data ?? []}
            columns={columns}
            loading={users.isLoading}
          />
        </Paper>
        <Paper sx={{ p: 2.5 }}>
          <Typography variant="h5">เพิ่มผู้ใช้ทดสอบ</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            GenericForm + yup validation
          </Typography>
          <GenericForm<NewUser>
            fields={userFields}
            schema={userSchema}
            defaultValues={{ name: "", role: "reporter" }}
            submitLabel="เพิ่มผู้ใช้"
            onSubmit={(values) => createUser.mutate(values)}
            isSubmitting={createUser.isPending}
          />
        </Paper>
      </Box>
    </Stack>
  );
}
