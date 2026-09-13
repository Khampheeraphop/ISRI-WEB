import {
  AddOutlined,
  CardGiftcardRounded,
  CategoryOutlined,
  DeleteOutlineRounded,
  EditOutlined,
  Inventory2Outlined,
  SearchRounded,
  StarsRounded,
  WarningAmberRounded,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  InputAdornment,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import type { GridColDef } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { GenericDataTable } from "../../components/GenericDataTable";
import { tableColumnAlignment } from "../../components/dataTable.constants";
import { ActionDialog } from "../../components/feedback/ActionDialog";
import { deleteReward, getAdminRewards, type Reward } from "./rewardsApi";

type RewardFilter = "all" | "redeem" | "campaign" | "annual" | "low-stock";

const filterOptions: Array<{ value: RewardFilter; label: string }> = [
  { value: "all", label: "ทั้งหมด" },
  { value: "redeem", label: "แลกด้วยคะแนน" },
  { value: "campaign", label: "รางวัลแคมเปญ" },
  { value: "annual", label: "รางวัลประจำปี" },
  { value: "low-stock", label: "ใกล้หมด" },
];

function getRewardType(reward: Reward): Exclude<RewardFilter, "all" | "low-stock"> {
  if (reward.rewardPeriod === "annual") return "annual";
  return reward.isActive ? "redeem" : "campaign";
}

function RewardTypeChip({ reward }: { reward: Reward }) {
  const type = getRewardType(reward);
  const detail = {
    redeem: { label: "แลกด้วยคะแนน", color: "#287357", bgcolor: "#ECF8F2" },
    campaign: { label: "รางวัลแคมเปญ", color: "#665D75", bgcolor: "#F3F1F6" },
    annual: { label: "รางวัลประจำปี", color: "#7351B5", bgcolor: "#F3EEFC" },
  }[type];

  return (
    <Chip
      size="small"
      label={detail.label}
      sx={{
        height: 26,
        color: detail.color,
        bgcolor: detail.bgcolor,
        border: `1px solid ${detail.color}2D`,
        fontSize: ".72rem",
        fontWeight: 600,
      }}
    />
  );
}

function StockIndicator({
  stock,
  vertical = false,
}: {
  stock: number;
  vertical?: boolean;
}) {
  const detail =
    stock === 0
      ? { label: "หมด", color: "#AA3731", bgcolor: "#FFF0EF" }
      : stock <= 5
        ? { label: "ใกล้หมด", color: "#97600F", bgcolor: "#FFF7E8" }
        : { label: "พร้อมใช้", color: "#287357", bgcolor: "#ECF8F2" };

  return (
    <Stack
      direction={vertical ? "column" : "row"}
      spacing={vertical ? 0.5 : 1}
      alignItems="center"
      sx={{ width: vertical ? "100%" : "auto" }}
    >
      <Typography sx={{ minWidth: vertical ? 0 : 24, fontWeight: 700, lineHeight: 1.2 }}>
        {stock}
      </Typography>
      <Chip
        size="small"
        label={detail.label}
        sx={{
          height: 24,
          color: detail.color,
          bgcolor: detail.bgcolor,
          fontSize: ".68rem",
          fontWeight: 700,
        }}
      />
    </Stack>
  );
}

function SummaryCard({
  label,
  value,
  helper,
  icon,
  background,
}: {
  label: string;
  value: number;
  helper: string;
  icon: ReactNode;
  background: string;
}) {
  return (
    <Card
      sx={{
        minHeight: { xs: 112, sm: 118 },
        p: { xs: 2, sm: 2.5 },
        display: "flex",
        position: "relative",
        isolation: "isolate",
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.5,
        color: "#FFFFFF",
        bgcolor: background,
        border: 0,
        borderRadius: 2.25,
        boxShadow: `0 10px 24px ${background}2B`,
        "&::after": {
          content: '\"\"',
          position: "absolute",
          zIndex: -1,
          width: 110,
          height: 110,
          right: -45,
          bottom: -65,
          borderRadius: "50%",
          bgcolor: "rgba(255,255,255,.08)",
        },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Stack direction="row" spacing={0.75} alignItems="baseline">
          <Typography
            sx={{
              color: "inherit",
              fontSize: { xs: "1.55rem", sm: "1.75rem" },
              fontWeight: 700,
              lineHeight: 1.15,
            }}
          >
            {value.toLocaleString("th-TH")}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,.82)", fontSize: ".72rem" }}>
            {helper}
          </Typography>
        </Stack>
        <Typography
          sx={{
            mt: 0.75,
            color: "rgba(255,255,255,.9)",
            fontSize: ".76rem",
            fontWeight: 500,
            lineHeight: 1.4,
          }}
        >
          {label}
        </Typography>
      </Box>
      <Box
        aria-hidden="true"
        sx={{
          flex: "0 0 auto",
          display: "grid",
          placeItems: "center",
          color: "rgba(255,255,255,.42)",
          "& .MuiSvgIcon-root": {
            fontSize: { xs: 40, sm: 48 },
          },
        }}
      >
        {icon}
      </Box>
    </Card>
  );
}

function RewardMobileCard({
  reward,
  onDelete,
}: {
  reward: Reward;
  onDelete: (reward: Reward) => void;
}) {
  return (
    <Card
      component="article"
      sx={{
        p: 2,
        borderRadius: 2.5,
        border: "1px solid #E1DAEC",
        boxShadow: "0 5px 18px rgba(50,38,84,.05)",
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Avatar
          variant="rounded"
          alt={reward.name}
          src={reward.imageUrl ?? undefined}
          sx={{
            width: 70,
            height: 70,
            flex: "0 0 auto",
            bgcolor: "#F7F5FA",
            border: "1px solid #ECE7F2",
            overflow: "hidden",
            "& .MuiAvatar-img": {
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            },
          }}
        >
          <CardGiftcardRounded />
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontWeight: 700, lineHeight: 1.45 }}>
            {reward.name}
          </Typography>
          <Typography
            sx={{
              mt: 0.25,
              color: "#6A6178",
              fontSize: ".76rem",
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {reward.description}
          </Typography>
          <Box sx={{ mt: 1 }}>
            <RewardTypeChip reward={reward} />
          </Box>
        </Box>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 1,
          mt: 2,
          p: 1.5,
          borderRadius: 2,
          bgcolor: "#F8F6FB",
        }}
      >
        <Box>
          <Typography sx={{ color: "#726A7E", fontSize: ".7rem" }}>
            คะแนนที่ใช้แลก
          </Typography>
          <Typography sx={{ mt: 0.25, fontWeight: 700 }}>
            {getRewardType(reward) === "redeem"
              ? `${reward.pointCost.toLocaleString("th-TH")} คะแนน`
              : "ไม่ใช้คะแนน"}
          </Typography>
        </Box>
        <Box>
          <Typography sx={{ color: "#726A7E", fontSize: ".7rem" }}>
            จำนวนคงเหลือ
          </Typography>
          <Box sx={{ mt: 0.25 }}>
            <StockIndicator stock={reward.stock} />
          </Box>
        </Box>
      </Box>

      <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
        <Button
          fullWidth
          component={Link}
          to={`/rewards/manage/${reward.id}`}
          variant="outlined"
          startIcon={<EditOutlined />}
          sx={{ minHeight: 42, borderRadius: 1.75 }}
        >
          แก้ไข
        </Button>
        <IconButton
          aria-label={`ลบ ${reward.name}`}
          onClick={() => onDelete(reward)}
          sx={{
            width: 44,
            height: 42,
            color: "#B43B34",
            bgcolor: "#FFF1F0",
            border: "1px solid #F1D1CE",
            borderRadius: 1.75,
          }}
        >
          <DeleteOutlineRounded />
        </IconButton>
      </Stack>
    </Card>
  );
}

export function RewardCatalogAdminPage() {
  const client = useQueryClient();
  const rewards = useQuery({
    queryKey: ["admin-rewards"],
    queryFn: getAdminRewards,
  });
  const [target, setTarget] = useState<Reward>();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<RewardFilter>("all");
  const [feedback, setFeedback] = useState<string>();
  const remove = useMutation({
    mutationFn: deleteReward,
    onSuccess: async () => {
      const deletedName = target?.name;
      await client.invalidateQueries({ queryKey: ["admin-rewards"] });
      setTarget(undefined);
      setFeedback(deletedName ? `ลบ “${deletedName}” เรียบร้อยแล้ว` : "ลบของรางวัลเรียบร้อยแล้ว");
    },
  });

  const allRewards = rewards.data ?? [];
  const stats = useMemo(
    () => ({
      total: allRewards.length,
      stock: allRewards.reduce((total, reward) => total + reward.stock, 0),
      redeemable: allRewards.filter((reward) => getRewardType(reward) === "redeem")
        .length,
      lowStock: allRewards.filter((reward) => reward.stock <= 5).length,
    }),
    [allRewards],
  );
  const filteredRewards = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("th-TH");
    return allRewards.filter((reward) => {
      const matchesSearch =
        !keyword ||
        reward.name.toLocaleLowerCase("th-TH").includes(keyword) ||
        reward.description.toLocaleLowerCase("th-TH").includes(keyword);
      const matchesFilter =
        filter === "all" ||
        (filter === "low-stock"
          ? reward.stock <= 5
          : getRewardType(reward) === filter);
      return matchesSearch && matchesFilter;
    });
  }, [allRewards, filter, search]);

  const columns: GridColDef<Reward>[] = [
    {
      field: "name",
      headerName: "ของรางวัล",
      minWidth: 330,
      flex: 1,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
          <Avatar
            variant="rounded"
            alt={row.name}
            src={row.imageUrl ?? undefined}
            sx={{
              width: 52,
              height: 52,
              flex: "0 0 auto",
              bgcolor: "#F7F5FA",
              border: "1px solid #ECE7F2",
              overflow: "hidden",
              "& .MuiAvatar-img": {
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              },
            }}
          >
            <CardGiftcardRounded />
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700 }} noWrap>
              {row.name}
            </Typography>
            <Typography sx={{ color: "#71687E", fontSize: ".74rem" }} noWrap>
              {row.description}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      field: "pointCost",
      headerName: "คะแนนแลก",
      width: 130,
      ...tableColumnAlignment.center,
      sortComparator: (left, right) => Number(left) - Number(right),
      renderCell: ({ row }) =>
        getRewardType(row) === "redeem" ? (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.6,
              mx: "auto",
            }}
          >
            <StarsRounded sx={{ fontSize: 17, color: "#8064B3" }} />
            <Typography sx={{ fontWeight: 700 }}>
              {row.pointCost.toLocaleString("th-TH")}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ width: "100%", textAlign: "center" }}>
            <Typography color="text.secondary">—</Typography>
          </Box>
        ),
    },
    {
      field: "stock",
      headerName: "คงเหลือ",
      width: 150,
      ...tableColumnAlignment.center,
      sortComparator: (left, right) => Number(left) - Number(right),
      renderCell: ({ row }) => (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <StockIndicator stock={row.stock} vertical />
        </Box>
      ),
    },
    {
      field: "usage",
      headerName: "ประเภทของรางวัล",
      width: 170,
      ...tableColumnAlignment.center,
      renderCell: ({ row }) => <RewardTypeChip reward={row} />,
    },
    {
      field: "actions",
      headerName: "จัดการ",
      width: 112,
      sortable: false,
      ...tableColumnAlignment.actions,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="แก้ไข">
            <IconButton
              component={Link}
              to={`/rewards/manage/${row.id}`}
              aria-label={`แก้ไข ${row.name}`}
              sx={{ color: "#514080", bgcolor: "#F3EFF9" }}
            >
              <EditOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="ลบ">
            <IconButton
              aria-label={`ลบ ${row.name}`}
              onClick={() => {
                remove.reset();
                setTarget(row);
              }}
              sx={{ color: "#B43B34", bgcolor: "#FFF1F0" }}
            >
              <DeleteOutlineRounded fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Stack spacing={{ xs: 2.5, md: 3 }}>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="overline"
            sx={{ color: "#654E98", fontWeight: 700, letterSpacing: ".08em" }}
          >
            คลังสิทธิประโยชน์
          </Typography>
          <Typography variant="h3" component="h1">
            จัดการของรางวัล
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            ดูแลรายการรางวัล คะแนนที่ใช้แลก และจำนวนคงเหลือ
          </Typography>
        </Box>
        <Button
          component={Link}
          to="/rewards/manage/new"
          variant="contained"
          startIcon={<AddOutlined />}
          sx={{
            width: { xs: "100%", sm: "auto" },
            minWidth: { sm: 160 },
            height: 46,
            minHeight: 46,
            alignSelf: { xs: "stretch", sm: "center" },
            flex: "0 0 auto",
            px: 2.25,
            py: 0,
            borderRadius: 2,
          }}
        >
          เพิ่มของรางวัล
        </Button>
      </Box>

      {rewards.isError && (
        <Alert severity="error">ไม่สามารถโหลดรายการของรางวัลได้</Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            md: "repeat(4, minmax(0, 1fr))",
          },
          gap: { xs: 1.5, md: 2 },
        }}
      >
        <SummaryCard
          label="ของรางวัลทั้งหมด"
          value={stats.total}
          helper="รายการ"
          icon={<CardGiftcardRounded />}
          background="#5A4698"
        />
        <SummaryCard
          label="สต็อกรวม"
          value={stats.stock}
          helper="ชิ้น"
          icon={<Inventory2Outlined />}
          background="#2F719E"
        />
        <SummaryCard
          label="แลกด้วยคะแนน"
          value={stats.redeemable}
          helper="รายการ"
          icon={<StarsRounded />}
          background="#267258"
        />
        <SummaryCard
          label="สต็อกใกล้หมด"
          value={stats.lowStock}
          helper="รายการ"
          icon={<WarningAmberRounded />}
          background="#A85E0A"
        />
      </Box>

      <Card
        sx={{
          overflow: "hidden",
          borderRadius: 2.5,
          border: "1px solid #DDD6E9",
          boxShadow: "0 8px 26px rgba(50,38,84,.05)",
        }}
      >
        <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", lg: "row" },
              alignItems: { xs: "stretch", lg: "center" },
              justifyContent: "space-between",
              gap: 1.5,
            }}
          >
            <TextField
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="ค้นหาชื่อหรือรายละเอียดของรางวัล"
              aria-label="ค้นหาของรางวัล"
              size="small"
              sx={{ width: { xs: "100%", md: 360 } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRounded color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Stack
              direction="row"
              spacing={1}
              sx={{
                minWidth: 0,
                flexWrap: { md: "wrap", lg: "nowrap" },
                overflowX: { xs: "auto", md: "visible" },
                rowGap: 1,
                pb: 0.25,
              }}
            >
              {filterOptions.map((option) => (
                <Chip
                  key={option.value}
                  clickable
                  label={option.label}
                  icon={option.value === "all" ? <CategoryOutlined /> : undefined}
                  onClick={() => setFilter(option.value)}
                  color={filter === option.value ? "primary" : "default"}
                  variant={filter === option.value ? "filled" : "outlined"}
                  sx={{ flex: "0 0 auto", fontWeight: filter === option.value ? 700 : 500 }}
                />
              ))}
            </Stack>
          </Box>
          <Typography sx={{ mt: 1.5, color: "#71687E", fontSize: ".78rem" }}>
            แสดง {filteredRewards.length.toLocaleString("th-TH")} จาก {allRewards.length.toLocaleString("th-TH")} รายการ
          </Typography>
        </Box>

        <Box sx={{ borderTop: "1px solid #E7E1EF", display: { xs: "none", md: "block" } }}>
          <GenericDataTable
            rows={filteredRewards}
            columns={columns}
            loading={rewards.isLoading}
            emptyMessage={search || filter !== "all" ? "ไม่พบของรางวัลที่ตรงกับเงื่อนไข" : "ยังไม่มีของรางวัล"}
            rowHeight={76}
            disableColumnMenu
          />
        </Box>

        <Stack
          spacing={1.5}
          sx={{
            display: { xs: "flex", md: "none" },
            p: 1.5,
            borderTop: "1px solid #E7E1EF",
            bgcolor: "#F9F8FB",
          }}
        >
          {rewards.isLoading ? (
            <Box sx={{ minHeight: 180, display: "grid", placeItems: "center" }}>
              <Typography color="text.secondary">กำลังโหลดรายการ...</Typography>
            </Box>
          ) : filteredRewards.length ? (
            filteredRewards.map((reward) => (
              <RewardMobileCard
                key={reward.id}
                reward={reward}
                onDelete={(selected) => {
                  remove.reset();
                  setTarget(selected);
                }}
              />
            ))
          ) : (
            <Box sx={{ py: 5, textAlign: "center" }}>
              <CardGiftcardRounded sx={{ fontSize: 38, color: "#A69CB5" }} />
              <Typography sx={{ mt: 1, color: "#6A6178" }}>
                {search || filter !== "all"
                  ? "ไม่พบของรางวัลที่ตรงกับเงื่อนไข"
                  : "ยังไม่มีของรางวัล"}
              </Typography>
            </Box>
          )}
        </Stack>
      </Card>

      <ActionDialog
        open={Boolean(target)}
        maxWidth="xs"
        title="ยืนยันการลบของรางวัล"
        icon={<DeleteOutlineRounded sx={{ color: "#B43B34" }} />}
        onRequestClose={() => !remove.isPending && setTarget(undefined)}
        footer={
          <>
            <Button onClick={() => setTarget(undefined)} disabled={remove.isPending}>
              ยกเลิก
            </Button>
            <Button
              color="error"
              variant="contained"
              startIcon={<DeleteOutlineRounded />}
              onClick={() => target && remove.mutate(target.id)}
              disabled={remove.isPending}
            >
              {remove.isPending ? "กำลังลบ..." : "ลบของรางวัล"}
            </Button>
          </>
        }
      >
        {target && (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              variant="rounded"
              alt={target.name}
              src={target.imageUrl ?? undefined}
              sx={{
                width: 58,
                height: 58,
                bgcolor: "#F7F5FA",
                overflow: "hidden",
                "& .MuiAvatar-img": {
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                },
              }}
            />
            <Box>
              <Typography sx={{ fontWeight: 700 }}>{target.name}</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.25, fontSize: ".82rem" }}>
                รายการที่ลบแล้วไม่สามารถกู้คืนได้
              </Typography>
            </Box>
          </Stack>
        )}
        {remove.isError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            ไม่สามารถลบของรางวัลได้ เนื่องจากอาจมีรายการแลกอ้างอิงอยู่
          </Alert>
        )}
      </ActionDialog>

      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={5000}
        onClose={() => setFeedback(undefined)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setFeedback(undefined)}
        >
          {feedback}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
