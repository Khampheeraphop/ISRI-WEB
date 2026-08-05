import {
  EmojiEventsOutlined,
  MilitaryTechOutlined,
  StarsOutlined,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { MainCard } from "../../components/base/MainCard";
import { useEntityQuery } from "../../hooks/useEntity";
import {
  campaignPeriodLabel,
  campaignStatusLabel,
  formatCampaignPeriod,
} from "./campaign.constants";

type LeaderboardRow = {
  id: string;
  rank: number;
  name: string;
  points: number;
};

const podiumDetail = {
  1: { label: "ผู้นำแคมเปญ", color: "#D79718", background: "#FFF8E7", height: 178 },
  2: { label: "อันดับ 2", color: "#6F7785", background: "#F3F5F8", height: 152 },
  3: { label: "อันดับ 3", color: "#A36B42", background: "#FFF4ED", height: 136 },
} as const;

const getInitials = (name: string) =>
  name
    .replace(/^(คุณ|นาย|นางสาว|นาง)\s*/u, "")
    .split(/\s+/u)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

function PodiumCard({ row }: { row: LeaderboardRow }) {
  const detail = podiumDetail[row.rank as 1 | 2 | 3];
  return (
    <Box
      sx={{
        order: { xs: row.rank, md: row.rank === 1 ? 2 : row.rank === 2 ? 1 : 3 },
        minHeight: detail.height,
        p: 2.25,
        borderRadius: 2,
        border: 1,
        borderColor: row.rank === 1 ? "#E8BE60" : "divider",
        bgcolor: detail.background,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <MilitaryTechOutlined
        sx={{ fontSize: row.rank === 1 ? 38 : 30, color: detail.color, mb: 0.75 }}
      />
      <Avatar
        sx={{
          width: row.rank === 1 ? 58 : 48,
          height: row.rank === 1 ? 58 : 48,
          bgcolor: "background.paper",
          color: detail.color,
          fontWeight: 700,
          border: 2,
          borderColor: detail.color,
          mb: 1,
        }}
      >
        {getInitials(row.name)}
      </Avatar>
      <Typography variant="body2" color="text.secondary">
        {detail.label}
      </Typography>
      <Typography variant={row.rank === 1 ? "h5" : "h6"} sx={{ mt: 0.2 }}>
        {row.name}
      </Typography>
      <Typography sx={{ fontWeight: 700, color: detail.color, mt: 0.5 }}>
        {row.points.toLocaleString("th-TH")} คะแนน
      </Typography>
    </Box>
  );
}

export function CampaignLeaderboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const campaigns = useEntityQuery("rewardCampaigns");
  const scores = useEntityQuery("campaignScores");
  const users = useEntityQuery("users");
  const selectedId = searchParams.get("campaign");
  const selectedCampaign =
    (campaigns.data ?? []).find((item) => item.id === selectedId) ??
    (campaigns.data ?? []).find((item) => item.status === "active") ??
    campaigns.data?.[0];
  const rows = useMemo<LeaderboardRow[]>(() => {
    if (!selectedCampaign) return [];
    const scoreByUserId = new Map(
      (scores.data ?? [])
        .filter((score) => score.campaignId === selectedCampaign.id)
        .map((score) => [score.userId, score.points]),
    );
    return (users.data ?? [])
      .filter((user) => user.role === "reporter")
      .map((user) => ({
        id: user.id,
        name: user.name,
        points: scoreByUserId.get(user.id) ?? 0,
        rank: 0,
      }))
      .sort((a, b) => b.points - a.points || a.name.localeCompare(b.name, "th"))
      .map((row, index) => ({ ...row, rank: index + 1 }));
  }, [scores.data, selectedCampaign, users.data]);
  const leaders = rows.slice(0, 3);
  const followers = rows.slice(3);
  const maxPoints = leaders[0]?.points || 1;

  if (campaigns.isLoading || scores.isLoading || users.isLoading)
    return (
      <Box sx={{ minHeight: 320, display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3">อันดับแคมเปญ</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          ตารางคะแนนแยกตามรอบแคมเปญ ไม่กระทบแต้มคงเหลือสำหรับแลกรางวัล
        </Typography>
      </Box>

      <FormControl sx={{ width: { xs: "100%", sm: 440 } }}>
        <InputLabel id="campaign-select-label">เลือกแคมเปญ</InputLabel>
        <Select
          labelId="campaign-select-label"
          label="เลือกแคมเปญ"
          value={selectedCampaign?.id ?? ""}
          onChange={(event) => setSearchParams({ campaign: event.target.value })}
        >
          {(campaigns.data ?? []).map((campaign) => (
            <MenuItem key={campaign.id} value={campaign.id}>
              {campaign.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {!selectedCampaign ? (
        <MainCard title={<Typography variant="h5">ยังไม่มีแคมเปญ</Typography>}>
          <Typography color="text.secondary">
            ผู้ดูแลระบบสามารถสร้างแคมเปญใหม่เพื่อเริ่มสะสมคะแนนได้
          </Typography>
        </MainCard>
      ) : (
        <>
          <MainCard
            sx={{ bgcolor: "primary.main", color: "primary.contrastText" }}
            contentSx={{ p: { xs: 3, md: 4 } }}
          >
            <Stack spacing={1.25}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.25}
                sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
              >
                <Box>
                  <Typography variant="h4">{selectedCampaign.name}</Typography>
                  <Typography sx={{ mt: 0.5, opacity: 0.84 }}>
                    {formatCampaignPeriod(selectedCampaign.startDate, selectedCampaign.endDate)}
                  </Typography>
                </Box>
                <Chip
                  label={campaignStatusLabel[selectedCampaign.status]}
                  color={selectedCampaign.status === "active" ? "success" : "default"}
                  sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
                />
              </Stack>
              <Typography sx={{ opacity: 0.9 }}>
                {campaignPeriodLabel[selectedCampaign.periodType]} · {selectedCampaign.prizeDescription}
              </Typography>
            </Stack>
          </MainCard>

          <MainCard
            title={
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <EmojiEventsOutlined color="primary" />
                <Typography variant="h5">
                  {selectedCampaign.status === "active" ? "ผู้นำแคมเปญ" : "ผลการจัดอันดับ"}
                </Typography>
              </Stack>
            }
            subheader={
              selectedCampaign.status === "active"
                ? "คะแนนจะอัปเดตเมื่อรายการแจ้งซ่อมดำเนินการเสร็จสิ้น"
                : "ปิดรอบแล้ว อันดับและคะแนนถูกล็อกเรียบร้อย"
            }
          >
            {!leaders.length ? (
              <Typography color="text.secondary">ยังไม่มีผู้เข้าร่วมแคมเปญ</Typography>
            ) : (
              <>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
                    gap: 1.5,
                    alignItems: "end",
                  }}
                >
                  {leaders.map((row) => <PodiumCard key={row.id} row={row} />)}
                </Box>
                {!!followers.length && (
                  <Stack spacing={1.25} sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      อันดับถัดไป
                    </Typography>
                    {followers.map((row) => (
                      <Box
                        key={row.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: { xs: 1.25, sm: 2 },
                          p: { xs: 1.5, sm: 2 },
                          border: 1,
                          borderColor: "divider",
                          borderRadius: 1.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: 34,
                            height: 34,
                            borderRadius: "50%",
                            display: "grid",
                            placeItems: "center",
                            bgcolor: "background.default",
                            fontWeight: 700,
                          }}
                        >
                          {row.rank}
                        </Box>
                        <Avatar sx={{ bgcolor: "primary.light", color: "primary.main" }}>
                          {getInitials(row.name)}
                        </Avatar>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography noWrap>{row.name}</Typography>
                          <Box sx={{ mt: 0.75, height: 5, borderRadius: 99, bgcolor: "divider" }}>
                            <Box
                              sx={{
                                width: `${Math.max(4, (row.points / maxPoints) * 100)}%`,
                                height: "100%",
                                borderRadius: 99,
                                bgcolor: "primary.main",
                              }}
                            />
                          </Box>
                        </Box>
                        <Stack direction="row" spacing={0.35} sx={{ alignItems: "center" }}>
                          <StarsOutlined color="primary" fontSize="small" />
                          <Typography sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                            {row.points.toLocaleString("th-TH")}
                          </Typography>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                )}
              </>
            )}
          </MainCard>
        </>
      )}
    </Stack>
  );
}
