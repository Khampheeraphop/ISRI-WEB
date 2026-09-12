import {
  AccessTimeOutlined,
  CalendarMonthOutlined,
  EmojiEventsOutlined,
  GroupsOutlined,
  Inventory2Outlined,
  LeaderboardOutlined,
  MilitaryTechOutlined,
  WorkspacePremiumOutlined,
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
import { useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { MainCard } from "../../components/base/MainCard";
import {
  campaignPeriodLabel,
  campaignStatusLabel,
  formatCampaignPeriod,
} from "./campaign.constants";
import { getCampaignLeaderboard, getCampaigns } from "./campaignApi";

type LeaderboardRow = {
  id: string;
  rank: number;
  name: string;
  points: number;
  lastScoredAt?: string;
};

const rankStyles = {
  1: {
    accent: "#C58A18",
    soft: "#FFF7DF",
    border: "#E8C76E",
    label: "อันดับ 1",
    medal: "🥇",
    podium: "linear-gradient(155deg, #6653A8 0%, #4B3B86 58%, #382B68 100%)",
    podiumText: "#FFFFFF",
    height: 154,
  },
  2: {
    accent: "#718096",
    soft: "#F4F6F8",
    border: "#CBD2DA",
    label: "อันดับ 2",
    medal: "🥈",
    podium: "linear-gradient(155deg, #E7EBF1 0%, #C9D1DD 58%, #AEB9C8 100%)",
    podiumText: "#344054",
    height: 112,
  },
  3: {
    accent: "#A8683B",
    soft: "#FFF1E8",
    border: "#D9AA88",
    label: "อันดับ 3",
    medal: "🥉",
    podium: "linear-gradient(155deg, #D99A6C 0%, #B76E3D 58%, #94532C 100%)",
    podiumText: "#FFFFFF",
    height: 82,
  },
} as const;

const getInitials = (name: string) =>
  name
    .replace(/^(คุณ|นาย|นางสาว|นาง)\s*/u, "")
    .split(/\s+/u)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

const formatUpdatedAt = (value?: string) => {
  if (!value) return "ยังไม่มีข้อมูล";
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

function SummaryItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: 1.5,
          display: "grid",
          placeItems: "center",
          color: "primary.main",
          bgcolor: "rgba(75, 59, 134, 0.08)",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography sx={{ fontWeight: 700, lineHeight: 1.35 }}>{value}</Typography>
      </Box>
    </Stack>
  );
}

function PodiumPlace({ row }: { row: LeaderboardRow }) {
  const style = rankStyles[row.rank as keyof typeof rankStyles];
  const isLeader = row.rank === 1;

  return (
    <Stack
      sx={{
        minWidth: 0,
        height: "100%",
        order: {
          xs: row.rank,
          md: row.rank === 2 ? 1 : row.rank === 1 ? 2 : 3,
        },
        justifyContent: "flex-end",
        alignItems: "stretch",
      }}
    >
      <Stack
        spacing={1}
        sx={{
          position: "relative",
          zIndex: 1,
          mb: 1.75,
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {isLeader && (
          <EmojiEventsOutlined
            aria-hidden="true"
            sx={{
              mb: -0.5,
              color: "#C58A18",
              fontSize: 34,
              filter: "drop-shadow(0 4px 6px rgba(197,138,24,0.24))",
            }}
          />
        )}
        <Chip
          label={`${style.medal} ${style.label}`}
          size="small"
          sx={{
            bgcolor: style.soft,
            color: style.accent,
            border: 1,
            borderColor: style.border,
            fontWeight: 700,
          }}
        />
        <Avatar
          sx={{
            width: isLeader ? 88 : 74,
            height: isLeader ? 88 : 74,
            bgcolor: isLeader ? "primary.main" : style.accent,
            color: "common.white",
            fontSize: isLeader ? 27 : 22,
            fontWeight: 700,
            border: "4px solid",
            borderColor: style.soft,
            outline: `1px solid ${style.border}`,
            boxShadow: "0 8px 20px rgba(35, 27, 58, 0.14)",
          }}
        >
          {getInitials(row.name)}
        </Avatar>
        <Box sx={{ minWidth: 0, width: "100%", px: 1 }}>
          <Typography noWrap sx={{ fontWeight: 700, fontSize: "1.05rem" }}>
            {row.name}
          </Typography>
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ mt: 0.5, alignItems: "baseline", justifyContent: "center" }}
          >
            <Typography
              sx={{
                color: "primary.main",
                fontSize: isLeader ? "2rem" : "1.65rem",
                fontWeight: 800,
                lineHeight: 1.2,
              }}
            >
              {row.points.toLocaleString("th-TH")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              คะแนน
            </Typography>
          </Stack>
        </Box>
      </Stack>
      <Box
        sx={{
          position: "relative",
          height: { xs: 82, md: style.height },
          minHeight: { xs: 82, md: style.height },
          display: "grid",
          placeItems: "center",
          color: style.podiumText,
          background: style.podium,
          borderRadius: "14px 14px 3px 3px",
          boxShadow: "inset 0 1px rgba(255,255,255,0.5), 0 12px 24px rgba(35,27,58,0.12)",
          overflow: "hidden",
          "&::after": {
            content: '""',
            position: "absolute",
            inset: "0 0 auto",
            height: 6,
            bgcolor: "rgba(255,255,255,0.28)",
          },
        }}
      >
        <Typography
          aria-hidden="true"
          sx={{
            position: "absolute",
            right: 14,
            bottom: -18,
            color: "currentColor",
            fontSize: { xs: "4.75rem", md: isLeader ? "7rem" : "5.75rem" },
            fontWeight: 800,
            lineHeight: 1,
            opacity: 0.13,
          }}
        >
          {row.rank}
        </Typography>
      </Box>
    </Stack>
  );
}

export function CampaignLeaderboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const campaigns = useQuery({
    queryKey: ["campaigns"],
    queryFn: getCampaigns,
  });
  const selectedId = searchParams.get("campaign");
  const selectedCampaign =
    (campaigns.data ?? []).find((item) => item.id === selectedId) ??
    (campaigns.data ?? []).find((item) => item.status === "active") ??
    campaigns.data?.[0];
  const leaderboard = useQuery({
    queryKey: ["campaign-leaderboard", selectedCampaign?.id],
    queryFn: () => getCampaignLeaderboard(selectedCampaign!.id),
    enabled: Boolean(selectedCampaign),
  });
  const rows = useMemo<LeaderboardRow[]>(() => {
    return (leaderboard.data?.scores ?? [])
      .map((score) => ({
        id: score.userId,
        name: score.name,
        points: score.points,
        lastScoredAt: score.lastScoredAt,
        rank: 0,
      }))
      .sort(
        (a, b) =>
          b.points - a.points ||
          (a.lastScoredAt ?? "9999").localeCompare(b.lastScoredAt ?? "9999") ||
          a.name.localeCompare(b.name, "th"),
      )
      .map((row, index) => ({ ...row, rank: index + 1 }));
  }, [leaderboard.data]);
  const leaders = rows.slice(0, 3);
  const followers = rows.slice(3);
  const maxPoints = rows[0]?.points || 1;
  const lastUpdatedAt = rows
    .map((row) => row.lastScoredAt)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1);

  if (campaigns.isLoading || (selectedCampaign && leaderboard.isLoading))
    return (
      <Box sx={{ minHeight: 320, display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Stack spacing={2.5}>
      <MainCard
        contentSx={{ p: 0 }}
        sx={{ overflow: "hidden", bgcolor: "background.paper" }}
      >
        <Box
          sx={{
            px: { xs: 2.25, md: 3 },
            py: { xs: 2.25, md: 2.5 },
            display: "flex",
            gap: 2.5,
            alignItems: { xs: "stretch", md: "center" },
            justifyContent: "space-between",
            flexDirection: { xs: "column", md: "row" },
            background:
              "linear-gradient(118deg, rgba(75,59,134,0.10) 0%, rgba(156,121,223,0.045) 52%, rgba(255,255,255,0) 100%)",
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Box
              sx={{
                width: 50,
                height: 50,
                flexShrink: 0,
                display: "grid",
                placeItems: "center",
                borderRadius: 2,
                color: "common.white",
                bgcolor: "primary.main",
                boxShadow: "0 8px 18px rgba(75,59,134,0.22)",
              }}
            >
              <LeaderboardOutlined />
            </Box>
            <Box>
              <Typography variant="h3">อันดับแคมเปญ</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.15 }}>
                เรียงตามคะแนน และใช้เวลาที่ทำคะแนนได้ก่อนเมื่อลำดับเท่ากัน
              </Typography>
            </Box>
          </Stack>
          <FormControl
            size="small"
            sx={{ width: { xs: "100%", md: 440 }, flexShrink: 0 }}
          >
            <InputLabel id="campaign-select-label">เลือกแคมเปญ</InputLabel>
            <Select
              labelId="campaign-select-label"
              label="เลือกแคมเปญ"
              value={selectedCampaign?.id ?? ""}
              onChange={(event) =>
                setSearchParams({ campaign: event.target.value })
              }
            >
              {(campaigns.data ?? []).map((campaign) => (
                <MenuItem key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {selectedCampaign && (
          <Box
            sx={{
              px: { xs: 2.25, md: 3 },
              py: { xs: 2, md: 2.25 },
              display: "flex",
              gap: { xs: 2, md: 3 },
              alignItems: { md: "center" },
              justifyContent: "space-between",
              flexDirection: { xs: "column", md: "row" },
              borderTop: 1,
              borderColor: "divider",
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 0.75 }}
              >
                <Typography variant="h5">{selectedCampaign.name}</Typography>
                <Chip
                  label={campaignStatusLabel[selectedCampaign.status]}
                  color={selectedCampaign.status === "active" ? "success" : "default"}
                  variant="outlined"
                  size="small"
                />
              </Stack>
              <Stack
                direction="row"
                spacing={2}
                useFlexGap
                sx={{ mt: 1, flexWrap: "wrap", color: "text.secondary" }}
              >
                <Stack direction="row" spacing={0.65} sx={{ alignItems: "center" }}>
                  <CalendarMonthOutlined sx={{ fontSize: 19, color: "primary.main" }} />
                  <Typography variant="body2">
                    {formatCampaignPeriod(
                      selectedCampaign.startDate,
                      selectedCampaign.endDate,
                    )}
                  </Typography>
                </Stack>
                <Typography variant="body2">
                  {campaignPeriodLabel[selectedCampaign.periodType]}
                </Typography>
                <Stack direction="row" spacing={0.65} sx={{ alignItems: "center" }}>
                  <WorkspacePremiumOutlined sx={{ fontSize: 19, color: "primary.main" }} />
                  <Typography variant="body2">
                    ผู้ชนะ {selectedCampaign.winnerCount} คน
                  </Typography>
                </Stack>
              </Stack>
            </Box>
            <Stack
              direction="row"
              spacing={1.25}
              sx={{
                alignItems: "center",
                width: { xs: "100%", md: 360 },
                p: 1.25,
                border: 1,
                borderColor: "divider",
                borderRadius: 2,
                bgcolor: "rgba(75, 59, 134, 0.035)",
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  width: 54,
                  height: 54,
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "rgba(75, 59, 134, 0.09)",
                  borderRadius: 1.5,
                  overflow: "hidden",
                }}
              >
                {selectedCampaign.reward?.imageUrl ? (
                  <Box
                    component="img"
                    src={selectedCampaign.reward.imageUrl}
                    alt={selectedCampaign.reward.name}
                    sx={{ width: "100%", height: "100%", objectFit: "contain", p: 0.5 }}
                  />
                ) : (
                  <Inventory2Outlined color="disabled" />
                )}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary">
                  รางวัลสำหรับผู้ชนะ
                </Typography>
                <Typography noWrap sx={{ fontWeight: 700 }}>
                  {selectedCampaign.reward?.name ?? selectedCampaign.prizeDescription}
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}
      </MainCard>

      {!selectedCampaign ? (
        <MainCard title={<Typography variant="h5">ยังไม่มีแคมเปญ</Typography>}>
          <Typography color="text.secondary">
            ผู้ดูแลระบบสามารถสร้างแคมเปญใหม่เพื่อเริ่มสะสมคะแนนได้
          </Typography>
        </MainCard>
      ) : (
        <>
          <MainCard
            contentSx={{ p: 0 }}
            sx={{ overflow: "hidden", bgcolor: "rgba(255,255,255,0.94)" }}
          >
            <Box
              sx={{
                px: { xs: 2.25, md: 3.25 },
                py: { xs: 2.25, md: 2.75 },
                display: "flex",
                gap: 2.5,
                flexDirection: { xs: "column", lg: "row" },
                alignItems: { lg: "center" },
                justifyContent: "space-between",
                borderBottom: 1,
                borderColor: "divider",
                background:
                  "linear-gradient(120deg, rgba(75,59,134,0.08) 0%, rgba(156,121,223,0.04) 48%, rgba(255,255,255,0) 100%)",
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: "grid",
                    placeItems: "center",
                    color: "common.white",
                    bgcolor: "primary.main",
                  }}
                >
                  <MilitaryTechOutlined />
                </Box>
                <Box>
                  <Typography variant="h4">
                    {selectedCampaign.status === "active" ? "ผู้นำแคมเปญ" : "ผลการจัดอันดับ"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedCampaign.status === "active"
                      ? "คะแนนอัปเดตเมื่อรายการแจ้งซ่อมดำเนินการเสร็จสิ้น"
                      : "ปิดรอบแล้ว อันดับและคะแนนถูกล็อกเรียบร้อย"}
                  </Typography>
                </Box>
              </Stack>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(145px, 1fr))" },
                  gap: { xs: 1.5, sm: 2.5 },
                }}
              >
                <SummaryItem
                  icon={<GroupsOutlined sx={{ fontSize: 21 }} />}
                  label="ผู้เข้าร่วม"
                  value={`${rows.length.toLocaleString("th-TH")} คน`}
                />
                <SummaryItem
                  icon={<EmojiEventsOutlined sx={{ fontSize: 21 }} />}
                  label="คะแนนสูงสุด"
                  value={`${(rows[0]?.points ?? 0).toLocaleString("th-TH")} คะแนน`}
                />
                <SummaryItem
                  icon={<AccessTimeOutlined sx={{ fontSize: 21 }} />}
                  label="อัปเดตล่าสุด"
                  value={formatUpdatedAt(lastUpdatedAt)}
                />
              </Box>
            </Box>

            <Box sx={{ px: { xs: 2.25, md: 3.25 }, py: { xs: 3, md: 3.5 } }}>
              {!leaders.length ? (
                <Stack
                  spacing={1}
                  sx={{ py: 5, alignItems: "center", textAlign: "center" }}
                >
                  <EmojiEventsOutlined sx={{ fontSize: 42, color: "text.secondary", opacity: 0.5 }} />
                  <Typography variant="h6">ยังไม่มีผู้เข้าร่วมแคมเปญ</Typography>
                  <Typography color="text.secondary">
                    อันดับจะแสดงที่นี่เมื่อมีผู้เข้าร่วมได้รับคะแนน
                  </Typography>
                </Stack>
              ) : (
                <>
                  <Box
                    sx={{
                      position: "relative",
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "minmax(0, 1fr)",
                        md: `repeat(${leaders.length}, minmax(0, 1fr))`,
                      },
                      alignItems: "end",
                      columnGap: { xs: 2, md: 0.75 },
                      rowGap: 2.5,
                      maxWidth: leaders.length === 1 ? 340 : 860,
                      mx: "auto",
                      pt: { xs: 0, md: 2 },
                      px: { xs: 0, md: 2 },
                      "&::after": {
                        content: '""',
                        display: { xs: "none", md: "block" },
                        position: "absolute",
                        zIndex: 0,
                        left: "4%",
                        right: "4%",
                        bottom: -14,
                        height: 28,
                        borderRadius: "50%",
                        background: "rgba(75, 59, 134, 0.10)",
                        filter: "blur(10px)",
                      },
                    }}
                  >
                    {leaders.map((row) => (
                      <PodiumPlace key={row.id} row={row} />
                    ))}
                  </Box>

                  <Box sx={{ mt: 3.5, maxWidth: 980, mx: "auto" }}>
                    <Stack
                      direction="row"
                      sx={{ alignItems: "center", justifyContent: "space-between" }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        อันดับถัดไป
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {followers.length ? `${followers.length} คน` : "รอผู้เข้าร่วมเพิ่มเติม"}
                      </Typography>
                    </Stack>
                    {!followers.length ? (
                      <Box
                        sx={{
                          mt: 1.25,
                          px: 2,
                          py: 2.25,
                          border: "1px dashed",
                          borderColor: "divider",
                          borderRadius: 2,
                          textAlign: "center",
                          bgcolor: "rgba(75, 59, 134, 0.02)",
                        }}
                      >
                        <Typography color="text.secondary">
                          ยังไม่มีอันดับถัดไป คะแนนของผู้เข้าร่วมใหม่จะแสดงในส่วนนี้
                        </Typography>
                      </Box>
                    ) : (
                      <Stack spacing={1} sx={{ mt: 1.25 }}>
                        {followers.map((row) => (
                          <Stack
                            key={row.id}
                            direction="row"
                            spacing={1.25}
                            sx={{
                              alignItems: "center",
                              px: { xs: 1.25, sm: 2 },
                              py: 1.25,
                              border: 1,
                              borderColor: "divider",
                              borderRadius: 1.75,
                              "&:hover": { bgcolor: "rgba(75, 59, 134, 0.025)" },
                            }}
                          >
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: 1.25,
                                display: "grid",
                                placeItems: "center",
                                color: "text.secondary",
                                bgcolor: "background.default",
                                fontWeight: 700,
                              }}
                            >
                              {row.rank}
                            </Box>
                            <Avatar
                              sx={{ width: 40, height: 40, bgcolor: "primary.light", fontSize: 14 }}
                            >
                              {getInitials(row.name)}
                            </Avatar>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography noWrap sx={{ fontWeight: 600 }}>
                                {row.name}
                              </Typography>
                              <Box
                                sx={{ mt: 0.7, height: 5, borderRadius: 9, bgcolor: "divider", overflow: "hidden" }}
                              >
                                <Box
                                  sx={{
                                    width: `${Math.max(4, (row.points / maxPoints) * 100)}%`,
                                    height: "100%",
                                    borderRadius: 9,
                                    bgcolor: "primary.main",
                                  }}
                                />
                              </Box>
                            </Box>
                            <Stack direction="row" spacing={0.4} sx={{ alignItems: "baseline" }}>
                              <Typography color="primary.main" sx={{ fontWeight: 800 }}>
                                {row.points.toLocaleString("th-TH")}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                คะแนน
                              </Typography>
                            </Stack>
                          </Stack>
                        ))}
                      </Stack>
                    )}
                  </Box>
                </>
              )}
            </Box>
          </MainCard>
        </>
      )}
    </Stack>
  );
}
